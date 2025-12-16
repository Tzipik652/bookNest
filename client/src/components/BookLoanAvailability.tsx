import { useState, useEffect, useMemo } from "react";
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
import { calculateDistance } from "../lib/geo";
import { useAccessibilityStore } from "../store/accessibilityStore";

// --- Types & Interfaces ---

interface BookLoanAvailabilityProps {
  bookId: string;
  bookTitle: string;
}

type CopyWithDistance = UserCopy & { distance?: number };

// --- Main Component ---

export function BookLoanAvailability({
  bookId,
  bookTitle,
}: BookLoanAvailabilityProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(["lending", "common"]);
  const { i18n } = useTranslation();
  const { user: currentUser } = useUserStore();
  
  // Get theme state
  const { darkMode, highContrast } = useAccessibilityStore();

  // --- Theme Classes Logic (Based on your snippet) ---
  const cardClass = highContrast
    ? "bg-black text-white border-2 border-white"
    : darkMode
    ? "bg-gray-900 text-white border-gray-700"
    : "bg-white text-gray-900 border-gray-200";

  const subTextClass = highContrast
    ? "text-yellow-300" // High contrast usually needs bright colors on black
    : darkMode
    ? "text-gray-300"
    : "text-gray-600";

  const locationBoxClass = highContrast
    ? "bg-black border border-white"
    : darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-gray-50 border-gray-100";

  const iconClass = highContrast
    ? "text-white"
    : darkMode
    ? "text-gray-400"
    : "text-gray-500";

  // --- Location Hooks ---
  const { coordinates: userCurrentCoordinates } = useGeoLocation(true);

  const {
    address: copyDisplayAddress,
    getAddressFromCoordinates: resolveCopyAddress,
    isLoading: loadingCopyAddress
  } = useGeoLocation(false);

  // --- State ---
  const [userCopy, setUserCopy] = useState<UserCopy | null>(null);
  const [availableCopies, setAvailableCopies] = useState<UserCopy[]>([]);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAllLocations, setShowAllLocations] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (userCopy?.loan_location_lat && userCopy?.loan_location_lon) {
      resolveCopyAddress(
        userCopy.loan_location_lat, 
        userCopy.loan_location_lon, 
        i18n.language
      );
    }
  }, [userCopy, i18n.language, resolveCopyAddress]);

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

          if (copy && copy.id) {
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
  }, [bookId, refreshKey, currentUser]);

  // --- Logic ---
  const { nearbyCopies, farCopies } = useMemo(() => {
    if (!availableCopies.length) return { nearbyCopies: [], farCopies: [] };

    const copiesWithDist: CopyWithDistance[] = availableCopies.map((copy) => {
      if (
        userCurrentCoordinates?.lat && 
        userCurrentCoordinates?.lon && 
        copy.loan_location_lat && 
        copy.loan_location_lon
      ) {
        return {
          ...copy,
          distance: calculateDistance(
            userCurrentCoordinates.lat,
            userCurrentCoordinates.lon,
            copy.loan_location_lat,
            copy.loan_location_lon
          ),
        };
      }
      return { ...copy, distance: undefined };
    });

    copiesWithDist.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return 0;
    });

    const THRESHOLD_KM = 20;
    const nearby: CopyWithDistance[] = [];
    const far: CopyWithDistance[] = [];

    copiesWithDist.forEach(copy => {
      if (copy.distance !== undefined && copy.distance <= THRESHOLD_KM) {
        nearby.push(copy);
      } else {
        far.push(copy);
      }
    });

    return { nearbyCopies: nearby, farCopies: far };
  }, [availableCopies, userCurrentCoordinates]);

  // --- Handlers ---
  if (!currentUser) return null;

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
      await sendChatMessage(loan.id, `Hi! I would like to borrow "${loan.user_copy?.book_title}". When would be a good time to pick it up?`, "status");
      navigate(`/loans/${loan.id}`);
    } catch (error: any) {
      toast.error(error.message || t("loanRequestError"));
    }
  };

  const handleMarkAsReturned = () => {
    if (activeLoan && activeLoan.id) {
      try {
          const { markLoanAsReturned } = require("../lib/storage"); 
          markLoanAsReturned(activeLoan.id);
          setRefreshKey((prev) => prev + 1);
          toast.success(t("loanReturned"));
      } catch (e) {
          console.error("Mark as returned error", e);
      }
    }
  };

  const handleModalSuccess = () => {
    setShowLoanModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  // --- Render Sections ---

  const renderOwnerSection = () => {
    if (!userCopy) {
      return (
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`${subTextClass} mb-4`}>{t("noCopyRegistered")}</p>
            <Button onClick={() => setShowLoanModal(true)} className="w-full">
              {t("addCopyForLending")}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (activeLoan && activeLoan.id) {
      return (
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Chip label={t("active")} color="secondary" variant="outlined" />
              <span className={`text-sm ${subTextClass}`}>
                {t("currentlyOnLoan")} {t("to")} {activeLoan.borrower_name}
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/loans/${activeLoan.id}`)} variant="outline" className="flex-1 gap-2">
                <MessageCircle className="h-4 w-4" />
                {t("openChat")}
              </Button>
              <Button onClick={handleMarkAsReturned} className="flex-1">
                {t("markAsReturned")}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!userCopy.is_available_for_loan) {
      return (
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("yourCopy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`${subTextClass} mb-4`}>{t("copyNotAvailable")}</p>
            <Button onClick={() => setShowLoanModal(true)} className="w-full">
              {t("makeAvailable")}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={cardClass}>
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
                // Material UI Chip might need inline styles or sx prop for dark mode overrides, 
                // but here we keep it standard as per your request.
            />
            
            <div className={`${locationBoxClass} p-3 rounded-md mt-2`}>
                <div className={`flex items-start gap-2 text-sm ${highContrast || darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <MapPin className="w-4 h-4 mt-1 text-primary shrink-0" />
                    <div>
                        <span className="font-semibold block">{t("pickupLocationLabel")}:</span>
                        {loadingCopyAddress ? (
                           <Skeleton width={150} height={20} />
                        ) : (
                           <span>
                             {copyDisplayAddress || t("locationUnknown")}
                           </span>
                        )}
                    </div>
                </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowLoanModal(true)} variant="outline" className="flex-1">
              {t("common:buttonEdit")}
            </Button>
            <Button onClick={handleDisableLending} variant="secondary" className="flex-1">
              {t("disableLending")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBorrowerSection = () => {
    const isMyCopyAvailableToLend = userCopy && userCopy.is_available_for_loan && !activeLoan;
    if (isMyCopyAvailableToLend) return null;

    if (availableCopies.length === 0) {
      return (
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("borrowFromCommunity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`${subTextClass} mb-2`}>{t("noCopiesAvailable")}</p>
            <p className={`text-sm ${subTextClass} opacity-80`}>{t("tryDifferentLocation")}</p>
          </CardContent>
        </Card>
      );
    }

    const shouldShowFar = showAllLocations || nearbyCopies.length === 0;

    return (
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {nearbyCopies.length > 0 ? t("copiesAvailableNearYou") : t("availableCopies")}
          </CardTitle>
          <CardDescription className={subTextClass}>
            {nearbyCopies.length > 0 
              ? `${nearbyCopies.length} ${t("copiesNearby")}` 
              : t("noCopiesNearbyShowingAll")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {nearbyCopies.map((copy) => (
            <CopyItem 
                key={copy.id} 
                copy={copy} 
                t={t} 
                onLoan={() => handleLoanRequest(copy.id!)} 
                iconClass={iconClass}
            />
          ))}

          {nearbyCopies.length > 0 && farCopies.length > 0 && !showAllLocations && (
             <div className={`pt-2 border-t mt-2 ${highContrast ? 'border-white' : darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <Button 
                    variant="ghost" 
                    className={`w-full text-sm ${subTextClass}`} 
                    onClick={() => setShowAllLocations(true)}
                >
                  {t("show")} {farCopies.length} {t("moreCopiesFurtherAway")}
                </Button>
            </div>
          )}

          {shouldShowFar && farCopies.length > 0 && (
             <div className={nearbyCopies.length > 0 ? `pt-4 border-t ${highContrast ? 'border-white' : darkMode ? 'border-gray-700' : 'border-gray-200'}` : ""}>
               {nearbyCopies.length > 0 && (
                 <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${subTextClass}`}>
                   {t("furtherLocations")}
                 </h4>
               )}
               <div className="space-y-3">
                 {farCopies.map((copy) => (
                    <CopyItem 
                        key={copy.id} 
                        copy={copy} 
                        t={t} 
                        onLoan={() => handleLoanRequest(copy.id!)} 
                        iconClass={iconClass}
                    />
                 ))}
               </div>
             </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`mb-2 ${highContrast || darkMode ? 'text-white' : 'text-gray-900'}`}>{t("lendingAvailability")}</h2>
        <p className={subTextClass}>{t("manageYourCopyOrBorrow")}</p>
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

// --- Sub Component ---

// Note: I brought useThemeStore into the sub-component as well to handle hover states cleanly
const CopyItem = ({ copy, t, onLoan, iconClass }: { copy: CopyWithDistance; t: any; onLoan: () => void; iconClass: string }) => {
  const { darkMode, highContrast } = useAccessibilityStore();

  const itemClass = highContrast
    ? "border border-white hover:bg-gray-900"
    : darkMode
    ? "bg-slate-950 border border-slate-800 hover:bg-slate-900"
    : "bg-white border border-gray-200 hover:bg-gray-50";

  const textClass = highContrast || darkMode ? "text-white" : "text-gray-900";

  return (
    <div className={`rounded-lg p-4 space-y-3 transition-colors ${itemClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className={`h-4 w-4 ${iconClass}`} />
          <span className={`font-medium ${textClass}`}>{copy.owner_name}</span>
        </div>
        {copy.distance !== undefined ? (
          <Chip
            label={`${copy.distance.toFixed(1)} ${t("km")}`}
            // Using standard color prop, adjusting classes manually if needed for high contrast
            color={copy.distance < 20 ? "success" : "default"}
            variant="outlined"
            size="small"
            className={highContrast || darkMode ? "!text-gray-300 !border-gray-600" : ""}
          />
        ) : (
          <span className={`text-xs ${iconClass}`}>{t("distanceUnknown")}</span>
        )}
      </div>
      <Button onClick={onLoan} className="w-full">
        {t("sendLoanRequest")}
      </Button>
    </div>
  );
};