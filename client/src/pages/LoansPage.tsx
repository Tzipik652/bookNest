import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getUserLoansAsBorrower,
  getUserLoansAsLender,
  approveLoan,
  cancelLoan,
} from "../services/loanService";
import { Loan } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button as ShadcnButton } from "../components/ui/button";

import { Button } from "../components/ui/button";
import {
  MessageCircle,
  BookOpen,
  User,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../store/useUserStore";
import { LoanStatus } from "../types";
import { Chip, Typography } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

export function LoansPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [borrowerLoans, setBorrowerLoans] = useState<Loan[]>([]);
  const [lenderLoans, setLenderLoans] = useState<Loan[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState(0);
  const { user: currentUser } = useUserStore();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const fetchUserLoans = async () => {
      try {
        const userLoansAsBorrower = await getUserLoansAsBorrower();
        const userLoansAsLender = await getUserLoansAsLender();
        setBorrowerLoans(userLoansAsBorrower);
        setLenderLoans(userLoansAsLender);
      } catch (error) {
        console.error("Error fetching user loans:", error);
      }
    };
    fetchUserLoans();
  }, [navigate, refreshKey]);

  const handleApproveLoan = async (loanId: string) => {
    try {
      await approveLoan(loanId);
      toast.success(t("lending.loanApproved"));
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelLoan = (loanId: string) => {
    try {
      cancelLoan(loanId);
      toast.success(t("lending.loanCancelled"));
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  function getStatusColor(status: LoanStatus) {
    switch (status) {
      case LoanStatus.REQUESTED:
        return "warning";
      case LoanStatus.ACTIVE:
      case LoanStatus.APPROVED:
        return "success";
      case LoanStatus.CANCELED:
      case LoanStatus.OVERDUE:
        return "error";
      case LoanStatus.RETURNED:
        return "info";
      default:
        return "default";
    }
  }

  const renderLoanCard = (loan: Loan, isBorrower: boolean) => {
    return (
      <Card key={loan.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {loan.user_copy.book_title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4" />
                {isBorrower
                  ? `${t("lending.owner")}: ${loan.user_copy.owner_name}`
                  : `Borrower: ${loan.borrower_name}`}
              </CardDescription>
            </div>
            <Chip
              label={t(`lending.${loan.status.toLowerCase()}`)}
              color={getStatusColor(loan.status)}
              variant="outlined"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              {t("lending.requestedOn")}:{" "}
              {new Date(loan.request_date).toLocaleDateString()}
            </p>
            {loan.loan_start_date && (
              <p>
                {t("lending.loanStartedOn")}:{" "}
                {new Date(loan.loan_start_date).toLocaleDateString()}
              </p>
            )}
            {loan.return_date && (
              <p>
                {t("lending.returnedOn")}:{" "}
                {new Date(loan.return_date).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/loans/${loan.id}`)}
              className="flex-1 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {t("lending.openChat")}
            </Button>

            {!isBorrower && loan.status === LoanStatus.REQUESTED && (
              <Button
                onClick={() => handleApproveLoan(loan.id)}
                className="flex-1 gap-2"
              >
                <Check className="h-4 w-4" />
                {t("lending.approveLoan")}
              </Button>
            )}

            {loan.status === LoanStatus.REQUESTED && (
              <Button
                onClick={() => handleCancelLoan(loan.id)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                {t("lending.cancelLoan")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ShadcnButton
          variant="ghost"
          onClick={() => navigate(-1)}
          aria-label={t("common:back")}
          className="mb-6 gap-2"
        >
          {t("common:dir") === "rtl" ? (
            <ArrowRight className="h-4 w-4" />
          ) : null}
          {t("common:dir") === "ltr" ? <ArrowLeft className="h-4 w-4" /> : null}
          {t("common:back")}
        </ShadcnButton>
        <div className="mb-8">
          <h1 className="mb-2">My Loans</h1>
          <p className="text-gray-600">
            Manage your borrowing and lending activities
          </p>
        </div>

        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label={`Borrowing (${borrowerLoans.length})`} />
          <Tab label={`Lending (${lenderLoans.length})`} />
        </Tabs>

        {/* Borrowing */}
        {tab === 0 && (
          <Box sx={{ mt: 3 }}>
            {borrowerLoans.length === 0 ? (
              <Card>
                <CardContent className="space-y-8 py-8 text-center">
                  <Typography>No borrowing requests yet</Typography>
                </CardContent>
              </Card>
            ) : (
              borrowerLoans.map((loan) => renderLoanCard(loan, true))
            )}
          </Box>
        )}

        {/* Lending */}
        {tab === 1 && (
          <Box sx={{ mt: 3 }}>
            {lenderLoans.length === 0 ? (
              <Card>
                <CardContent className="space-y-8 py-8 text-center">
                  <Typography>No lending requests yet</Typography>
                </CardContent>
              </Card>
            ) : (
              lenderLoans.map((loan) => renderLoanCard(loan, false))
            )}
          </Box>
        )}
      </div>
    </div>
  );
}
