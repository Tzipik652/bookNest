import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getActiveLoanForCopy,
  createLoanRequest,
} from "../services/loanService";
import {
  disableLending,
  getAvailableCopiesForBook,
  getBookCopies,
  getUserCopy,
} from "../services/userCopiesService";
import { Loan, UserCopy } from "../types";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { BookOpen, MapPin, User, MessageCircle } from "lucide-react";
import { LoanFormModal } from "./LoanFormModal";
import { toast } from "sonner";
import { useUserStore } from "../store/useUserStore";
import { Chip } from "@mui/material";

interface BookLoanAvailabilityProps {
  bookId: string;
  bookTitle: string;
}

export function BookLoanAvailability({
  bookId,
  bookTitle,
}: BookLoanAvailabilityProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userCopy, setUserCopy] = useState<UserCopy | null>(null);
  const [availableCopies, setAvailableCopies] = useState<
    (UserCopy & { distance?: number })[]
  >([]);
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user: currentUser } = useUserStore();

  // Mock user location (in a real app, this would come from geolocation API or user settings)
  const userLocation = { lat: 40.7128, lon: -74.006 }; // New York City

  useEffect(() => {
    const fetchUserCopy = async () => {
      let copy = null;

      try {
        if (currentUser) {
          try {
            copy = await getUserCopy(bookId);
            setUserCopy(copy);
          } catch (err: any) {
            if (err?.response?.status === 404) {
              setUserCopy(null);
            } else {
              throw err;
            }
          }

          if (copy) {
            try {
              const loan = await getActiveLoanForCopy(copy.id);
              setActiveLoan(loan);
            } catch (err) {
              console.error("Error fetching loan:", err);
              setActiveLoan(null);
            }
          } else {
            setActiveLoan(null);
          }
        }
        const copies = await getAvailableCopiesForBook(bookId);
        setAvailableCopies(copies);
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchUserCopy();
  }, [bookId, refreshKey]);

  if (!currentUser) {
    return null; // Or show a message to log in
  }

  const handleDisableLending = async () => {
    try {
      const copyUpdated = await disableLending(userCopy?.id?.toString() ?? "");
      //לעדכן בצורה יעילה יותר את הסטטוס
    } catch (err) {
      toast.error(t("lending.copyUpdateError"));
    } finally {
      setRefreshKey((prev) => prev + 1);
      toast.success(t("lending.copyUpdatedSuccess"));
    }
  };

  const handleLoanRequest = async (copyId: string) => {
    try {
      const loan: Loan = await createLoanRequest(copyId);
      toast.success(t("lending.loanRequestSent"));

      // Auto-generate first message and navigate to chat
      navigate(`/loans/${loan.id}`);
    } catch (error: any) {
      toast.error(error.message || t("lending.loanRequestError"));
    }
  };

  const handleMarkAsReturned = () => {
    if (activeLoan) {
      const { markLoanAsReturned } = require("../lib/storage");
      markLoanAsReturned(activeLoan.id);
      setRefreshKey((prev) => prev + 1);
      toast.success(t("lending.loanReturned"));
    }
  };

  const handleModalSuccess = () => {
    setShowLoanModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  // Render owner's copy status
  const renderOwnerSection = () => {
    if (!userCopy) {
      // No copy registered
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("lending.yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {t("lending.noCopyRegistered")}
            </p>
            <Button onClick={() => setShowLoanModal(true)} className="w-full">
              {t("lending.addCopyForLending")}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (activeLoan) {
      // Copy is under active loan
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("lending.yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Chip
                label={t("lending.active")}
                color="secondary"
                variant="outlined"
              />
              <span className="text-sm text-gray-600">
                {t("lending.currentlyOnLoan")} {t("lending.to")}{" "}
                {activeLoan.borrowerName}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate(`/loans/${activeLoan.id}`)}
                variant="outline"
                className="flex-1 gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {t("lending.openChat")}
              </Button>
              <Button onClick={handleMarkAsReturned} className="flex-1">
                {t("lending.markAsReturned")}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!userCopy.is_available_for_loan) {
      // Copy exists but not available
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("lending.yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {t("lending.copyNotAvailable")}
            </p>
            <Button onClick={() => setShowLoanModal(true)} className="w-full">
              {t("lending.makeAvailable")}
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Copy exists and is available
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("lending.yourCopy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Chip
              label={t("lending.availableForLoan")}
              color="default"
              variant="outlined"
            />
            <p className="text-sm text-gray-600 mt-2">
              {t("lending.copyAvailable")}{" "}
              {userCopy.loan_location_lat && userCopy.loan_location_lon && (
                <>
                  {t("lending.at")} ({userCopy.loan_location_lat.toFixed(4)},{" "}
                  {userCopy.loan_location_lon.toFixed(4)})
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowLoanModal(true)}
              variant="outline"
              className="flex-1"
            >
              {t("bookDetails.edit")}
            </Button>
            <Button
              onClick={handleDisableLending}
              variant="secondary"
              className="flex-1"
            >
              {t("lending.disableLending")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render available copies from other users
  const renderBorrowerSection = () => {
    if (userCopy) {
      // User owns a copy, no need to show borrowing options
      return null;
    }

    if (availableCopies.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("lending.borrowFromCommunity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-2">
              {t("lending.noCopiesAvailable")}
            </p>
            <p className="text-sm text-gray-500">
              {t("lending.tryDifferentLocation")}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("lending.copiesAvailableNearYou")}
          </CardTitle>
          <CardDescription>
            {availableCopies.length}{" "}
            {availableCopies.length === 1 ? "copy" : "copies"} available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableCopies.map((copy) => (
            <div key={copy.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{copy.owner_name}</span>
                </div>
                {copy.distance !== undefined && (
                  <Chip
                    label={`${copy.distance} ${t("lending.km")}`}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </div>

              <Button
                onClick={() => handleLoanRequest(copy.id ?? "")}
                className="w-full"
              >
                {t("lending.sendLoanRequest")}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">{t("lending.lendingAvailability")}</h2>
        <p className="text-gray-600">
          Manage your copy or borrow from the community
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>{renderOwnerSection()}</div>
        <div>{renderBorrowerSection()}</div>
      </div>

      {showLoanModal && (
        <LoanFormModal
          bookId={bookId}
          bookTitle={bookTitle}
          existingCopy={userCopy}
          onClose={() => setShowLoanModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
