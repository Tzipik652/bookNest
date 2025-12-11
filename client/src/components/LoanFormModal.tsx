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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { FormControlLabel, Switch } from "@mui/material";

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl border rounded-xl">
        <DialogHeader>
          <DialogTitle>{t("lending.manageCopy")}</DialogTitle>
          <DialogDescription>{bookTitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lending Status */}
          <div className="space-y-2">
            <Label htmlFor="lending-status">{t("lending.lendingStatus")}</Label>
            <div className="flex items-center gap-3">
              <FormControlLabel
                control={
                  <Switch
                    checked={isAvailable}
                    onChange={(event) => setIsAvailable(event.target.checked)}
                  />
                }
                label={isAvailable
                  ? t("lending.availableForLoan")
                  : t("lending.notAvailableForLoan")}
              />
            </div>
          </div>

          {/* Location Selection (only show if available for loan) */}
          {isAvailable && (
            <div className="space-y-2">
              <Label>{t("lending.pickupLocation")}</Label>
              <p className="text-sm text-gray-500 mb-2">
                {t("lending.enterLocationCoordinates")}
              </p>

              {/* Location Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-xs text-gray-500">
                    {t("lending.latitude")}
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={locationLat}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      if (!isNaN(lat)) {
                        setLocationLat(lat);
                      }
                    }}
                    placeholder="40.7128"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-xs text-gray-500">
                    {t("lending.longitude")}
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={locationLon}
                    onChange={(e) => {
                      const lon = parseFloat(e.target.value);
                      if (!isNaN(lon)) {
                        setLocationLon(lon);
                      }
                    }}
                    placeholder="-74.0060"
                  />
                </div>
              </div>

              {/* Visual Location Display */}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm">
                      <strong>{t("lending.pickupLocationLabel")}:</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {locationLat.toFixed(4)}°, {locationLon.toFixed(4)}°
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("lending.cancel")}
            </Button>
            <Button type="submit">{t("lending.saveCopy")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
