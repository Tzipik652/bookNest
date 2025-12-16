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
import { Chip, Skeleton } from "@mui/material";
import { sendChatMessage } from "../services/chatMessagesService";
import { useGeoLocation } from "../hooks/useGeoLocation";

interface BookLoanAvailabilityProps {
  bookId: string;
  bookTitle: string;
}

export function BookLoanAvailability({
  bookId,
  bookTitle,
}: BookLoanAvailabilityProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(["lending", "common"]);
  const { i18n } = useTranslation();
  const {
    address: userCopyAddress,
    getAddressFromCoordinates,
    isLoading: loadingAddress,
  } = useGeoLocation();

  const [userCopy, setUserCopy] = useState<UserCopy | null>(null);
  const [availableCopies, setAvailableCopies] = useState<
    (UserCopy & { distance?: number })[]
  >([]);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user: currentUser } = useUserStore();

  useEffect(() => {
    if (userCopy?.loan_location_lat && userCopy?.loan_location_lon) {
      getAddressFromCoordinates(
        userCopy.loan_location_lat,
        userCopy.loan_location_lon,
        i18n.language
      );
    }
  }, [userCopy, i18n.language]);

  // const userLocation = { lat: 40.7128, lon: -74.006 }; // New York City

  useEffect(() => {
    const fetchUserCopy = async () => {
      let copy = null;

      try {
        if (currentUser) {
          try {
            copy = await getUserCopy(bookId);
            setUserCopy(copy || null);
          } catch (err: any) {
            if (err?.response?.status === 404) {
              setUserCopy(null);
            } else {
              throw err;
            }
          }

          if (copy) {
            try {
              const loan = await getActiveLoanForCopy(copy.id ?? "");
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
      await disableLending(userCopy?.id?.toString() ?? "");
    } catch (err) {
      toast.error(t("copyUpdateError"));
    } finally {
      setRefreshKey((prev) => prev + 1);
      toast.success(t("copyUpdatedSuccess"));
    }
  };

  const handleLoanRequest = async (copyId: string) => {
    try {
      const loan: Loan = await createLoanRequest(copyId);
      toast.success(t("loanRequestSent"));
      await sendChatMessage(
        loan.id,
        `Hi! I would like to borrow "${loan.user_copy?.book_title}". When would be a good time to pick it up?`,
        "status"
      );
      navigate(`/loans/${loan.id}`);
    } catch (error: any) {
      toast.error(error.message || t("loanRequestError"));
    }
  };

  const handleMarkAsReturned = () => {
    if (activeLoan && activeLoan.id) {
      const { markLoanAsReturned } = require("../lib/storage");
      markLoanAsReturned(activeLoan.id);
      setRefreshKey((prev) => prev + 1);
      toast.success(t("loanReturned"));
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
              {t("yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{t("noCopyRegistered")}</p>
            <Button onClick={() => setShowLoanModal(true)} className="w-full" aria-label={t("addCopyForLending")}>
              {t("addCopyForLending")}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (activeLoan && activeLoan.id) {
      // Copy is under active loan
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Chip label={t("active")} color="secondary" variant="outlined" />
              <span className="text-sm text-gray-600">
                {t("currentlyOnLoan")} {t("to")} {activeLoan.borrower_name}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate(`/loans/${activeLoan.id}`)}
                variant="outline"
                className="flex-1 gap-2"
                aria-label={t("openChat")}
              >
                <MessageCircle className="h-4 w-4" />
                {t("openChat")}
              </Button>
              <Button onClick={handleMarkAsReturned} className="flex-1" aria-label={t("markAsReturned")}>
                {t("markAsReturned")}
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
              {t("yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{t("copyNotAvailable")}</p>
            <Button onClick={() => setShowLoanModal(true)} className="w-full" aria-label={t("makeAvailable")}>
              {t("makeAvailable")}
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
            {t("yourCopy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Chip
              label={t("availableForLoan")}
              color="default"
              variant="outlined"
              className="mb-2"
            />

            <div className="bg-gray-50 p-3 rounded-md border border-gray-100 mt-2">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 mt-1 text-primary shrink-0" />
                <div>
                  <span className="font-semibold block">
                    {t("pickupLocationLabel")}:
                  </span>
                  {/* תצוגת הכתובת או טעינה */}
                  {loadingAddress ? (
                    <Skeleton width={150} height={20} />
                  ) : (
                    <span>{userCopyAddress || t("locationUnknown")}</span>
                  )}

                  {/* הצגת קואורדינטות בקטן למפתחים/דיבוג (אופציונלי) */}
                  {/* <span className="text-xs text-gray-400 block mt-1 font-mono">
                            {userCopy.loan_location_lat.toFixed(4)}, {userCopy.loan_location_lon.toFixed(4)}
                        </span>
                        */}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowLoanModal(true)}
              variant="outline"
              className="flex-1"
              aria-label={t("common:buttonEdit")}
            >
              {t("common:buttonEdit")}
            </Button>
            <Button
              onClick={handleDisableLending}
              variant="secondary"
              className="flex-1"
              aria-label={t("makeUnavailable")}
            >
              {t("makeUnavailable")}
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
              {t("borrowFromCommunity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-2">{t("noCopiesAvailable")}</p>
            <p className="text-sm text-gray-500">{t("tryDifferentLocation")}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("copiesAvailableNearYou")}
          </CardTitle>
          <CardDescription>
            {availableCopies.length}{" "}
            {availableCopies.length === 1 ? "copy" : "copies"} available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableCopies.map((copy) => {
            return (
              <div key={copy.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{copy?.owner_name}</span>
                  </div>
                  {copy?.distance !== undefined && (
                    <Chip
                      label={`${copy?.distance} ${t("km")}`}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </div>

                <Button
                  onClick={() => handleLoanRequest(copy.id ?? "")}
                  className="w-full"
                  aria-label={t("sendLoanRequest")}
                >
                  {t("sendLoanRequest")}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">{t("lendingAvailability")}</h2>
        <p className="text-gray-600">{t("manageYourCopyOrBorrow")}</p>
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
