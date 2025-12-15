import { Button, Input } from "@mui/material";
import { useState } from "react";
interface DueDatePickerProps{
  onConfirm: (date:string)=>void;
}
export default function DueDatePicker({ onConfirm }:DueDatePickerProps) {
  const [date, setDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex gap-2 justify-center mt-2">
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        size="small"
        inputProps={{min:today}}
      />
      <Button
        size="small"
        disabled={!date}
        onClick={() => onConfirm(date)}
      >
        אישור תאריך
      </Button>
    </div>
  );
}
