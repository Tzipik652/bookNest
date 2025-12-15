import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserCopy } from "../types";
import {
  addUserCopy,
  changeLoanLocation,
  changeStatus,
} from "../services/userCopiesService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { toast } from "sonner";
import { MapPin, Navigation } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useGeoLocation } from "../hooks/useGeoLocation";

interface LoanFormModalProps {
  bookId: string;
  bookTitle: string;
  existingCopy: UserCopy | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoanFormModal({
  bookId,
  bookTitle,
  existingCopy,
  onClose,
  onSuccess,
}: LoanFormModalProps) {
  const { i18n } = useTranslation();
  const { t } = useTranslation(["lending", "common"]);
  const {
    coordinates,
    address,
    isLoading: loadingLocation,
    error: locationError,
    getCurrentLocation,
    getAddressFromCoordinates
  } = useGeoLocation();
  const [isAvailable, setIsAvailable] = useState(
    existingCopy?.is_available_for_loan ?? true
  );
  const [locationLat, setLocationLat] = useState(
    existingCopy?.loan_location_lat ?? 0
  );
  const [locationLon, setLocationLon] = useState(
    existingCopy?.loan_location_lon ?? 0
  );
  const { user: currentUser } = useUserStore();

  useEffect(() => {
    if (coordinates) {
      setLocationLat(coordinates.lat);
      setLocationLon(coordinates.lon);
    }
  }, [coordinates]);

  useEffect(() => {
    const latToUse = coordinates?.lat || locationLat;
    const lonToUse = coordinates?.lon || locationLon;

    if (latToUse && lonToUse && latToUse !== 0) {
      getAddressFromCoordinates(latToUse, lonToUse, i18n.language);
    }
  }, [existingCopy, i18n.language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?._id) {
      toast.error(t("common:missingRequiredData"));
      return;
    }
    if (isAvailable && (locationLat === 0 || locationLon === 0)) {
      toast.error(t("pleaseSelectLocation") || "Please select a location");
      return;
    }
    try {
      if (existingCopy && existingCopy.is_available_for_loan !== isAvailable) {
        await changeStatus(existingCopy.id?.toString() ?? "");
      }

      if (isAvailable && existingCopy) {
        const latChanged = existingCopy.loan_location_lat !== locationLat;
        const lonChanged = existingCopy.loan_location_lon !== locationLon;

        if (latChanged || lonChanged) {
          await changeLoanLocation(
            locationLat,
            locationLon,
            existingCopy.id?.toString() ?? ""
          );
        }
      }

      if (!existingCopy) {
        await addUserCopy({
          book_id: bookId,
          is_available_for_loan: isAvailable,
          loan_location_lat: isAvailable ? locationLat : 0,
          loan_location_lon: isAvailable ? locationLon : 0,
          owner_id: currentUser._id,
        });
      }

      toast.success(
        existingCopy
          ? t("copyUpdatedSuccess")
          : t("copyAddedSuccess")
      );
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("common:error"));
    }
  };

  return (

    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("manageCopy")}</DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {bookTitle}
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Lending Status */}
          <Box my={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={(event) => setIsAvailable(event.target.checked)}
                />
              }
              label={
                isAvailable
                  ? t("availableForLoan")
                  : t("notAvailableForLoan")
              }
            />
          </Box>

          {/* Location Selection Area */}
          {isAvailable && (
            <Box my={2} p={2} bgcolor="grey.50" borderRadius={2} border="1px solid #e0e0e0">
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                {t("pickupLocation")}
              </Typography>

              <Box display="flex" flexDirection="column" gap={2} mt={1}>

                {/* Location Button */}
                <Button
                  variant="outlined"
                  startIcon={loadingLocation ? <CircularProgress size={20} /> : <Navigation size={18} />}
                  onClick={() => getCurrentLocation(i18n.language)} // Pass current language
                  disabled={loadingLocation}
                  fullWidth
                  sx={{ justifyContent: "flex-start", py: 1.5, textTransform: 'none' }}
                >
                  {loadingLocation ? t("common:loading") : t("useMyLocation") || "Use my current location"}
                </Button>

                {locationError && (
                  <Alert severity="error">{locationError}</Alert>
                )}

                {/* Address Display Card */}
                {(locationLat !== 0 || locationLon !== 0) && (
                  <Box mt={1} p={2} bgcolor="white" borderRadius={1} border="1px solid #eee">
                    <Box display="flex" gap={1.5} alignItems="flex-start">
                      <MapPin className="text-primary" size={20} style={{ marginTop: 4 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {address || t("locationSelected")}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace' }}>
                          {locationLat.toFixed(6)}, {locationLon.toFixed(6)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Actions */}
          <DialogActions>
            <Button variant="outlined" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="contained">
              {t("saveCopy")}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>

  );
}
