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
} from "@mui/material";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

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
  const { t } = useTranslation();
  const [isAvailable, setIsAvailable] = useState(
    existingCopy?.is_available_for_loan ?? true
  );
  const [locationLat, setLocationLat] = useState(
    existingCopy?.loan_location_lat ?? 40.7128
  );
  const [locationLon, setLocationLon] = useState(
    existingCopy?.loan_location_lon ?? -74.006
  );
  const { user: currentUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?._id) {
      toast.error(t("common.missingRequiredData"));
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
          ? t("lending.copyUpdatedSuccess")
          : t("lending.copyAddedSuccess")
      );
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("common.error"));
    }
  };

  return (

<Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
  <DialogTitle>{t("lending.manageCopy")}</DialogTitle>

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
              ? t("lending.availableForLoan")
              : t("lending.notAvailableForLoan")
          }
        />
      </Box>

      {/* Location Selection */}
      {isAvailable && (
        <Box my={2}>
          <Typography variant="body2" gutterBottom>
            {t("lending.pickupLocation")}
          </Typography>
          <Typography variant="caption" color="textSecondary" gutterBottom>
            {t("lending.enterLocationCoordinates")}
          </Typography>

          <Box display="flex" gap={2} mb={2} mt={2}>
            <TextField
              label={t("lending.latitude")}
              type="number"
              value={locationLat}
              onChange={(e) => {
                const lat = parseFloat(e.target.value);
                if (!isNaN(lat)) setLocationLat(lat);
              }}
              fullWidth
            />
            <TextField
              label={t("lending.longitude")}
              type="number"
              value={locationLon}
              onChange={(e) => {
                const lon = parseFloat(e.target.value);
                if (!isNaN(lon)) setLocationLon(lon);
              }}
              fullWidth
            />
          </Box>

          {/* Visual Location Display */}
          <Box
            display="flex"
            alignItems="flex-start"
            gap={1}
            p={2}
            bgcolor="grey.100"
            borderRadius={1}
          >
            <MapPin size={20} className="text-primary" />
            <Box>
              <Typography variant="caption" fontWeight="bold">
                {t("lending.pickupLocationLabel")}:
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {locationLat.toFixed(4)}°, {locationLon.toFixed(4)}°
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Actions */}
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {t("lending.cancel")}
        </Button>
        <Button type="submit" variant="contained">
          {t("lending.saveCopy")}
        </Button>
      </DialogActions>
    </form>
  </DialogContent>
</Dialog>

  );
}
