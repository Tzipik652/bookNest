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
// שימי לב: מחקתי כפילות של Button import והשארתי אחד
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
  const { t, i18n } = useTranslation(["lending", "common"]); // הוספת i18n
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
  }, [navigate, refreshKey, currentUser]);

  const handleApproveLoan = async (loanId: string) => {
    try {
      await approveLoan(loanId);
      toast.success(t("loanApproved"));
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelLoan = (loanId: string) => {
    try {
      cancelLoan(loanId);
      toast.success(t("loanCancelled"));
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // פונקציית עזר לפרמוט תאריך לפי השפה הנוכחית
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
      });
  };

  function getStatusColor(status: LoanStatus) {
    switch (status) {
      case LoanStatus.REQUESTED: return "warning";
      case LoanStatus.ACTIVE:
      case LoanStatus.APPROVED: return "success";
      case LoanStatus.CANCELED:
      case LoanStatus.OVERDUE: return "error";
      case LoanStatus.RETURNED: return "info";
      default: return "default";
    }
  }

  const renderLoanCard = (loan: Loan, isBorrower: boolean) => {
    return (
      <Card key={loan.id} className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                {loan.user_copy.book_title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4" />
                {isBorrower
                  ? `${t("owner")}: ${loan.user_copy.owner_name}`
                  : `${t("borrower")}: ${loan.borrower_name}`}
              </CardDescription>
            </div>
            {/* שימוש במפתח הסטטוס המאוחד שלנו */}
            <Chip
              label={t(`loanChat.status.${loan.status}`)}
              color={getStatusColor(loan.status)}
              variant="outlined"
              size="small"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">{t("requestedOn")}:</span>{" "}
              {formatDate(loan.request_date)}
            </p>
            {loan.loan_start_date && (
              <p>
                <span className="font-medium">{t("loanStartedOn")}:</span>{" "}
                {formatDate(loan.loan_start_date)}
              </p>
            )}
            {loan.return_date && (
              <p>
                <span className="font-medium">{t("returnedOn")}:</span>{" "}
                {formatDate(loan.return_date)}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate(`/loans/${loan.id}`)}
              className="flex-1 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {t("openChat")}
            </Button>

            {!isBorrower && loan.status === LoanStatus.REQUESTED && (
              <Button
                onClick={() => handleApproveLoan(loan.id)}
                className="flex-1 gap-2"
              >
                <Check className="h-4 w-4" />
                {t("approveLoan")}
              </Button>
            )}

            {loan.status === LoanStatus.REQUESTED && (
              <Button
                variant="destructive" // שינוי ל-destructive עבור ביטול
                onClick={() => handleCancelLoan(loan.id)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                {t("cancelLoan")}
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          aria-label={t("common:back")}
          className="mb-6 gap-2 p-0 hover:bg-transparent"
        >
          {t("common:dir") === "rtl" ? (
            <ArrowRight className="h-4 w-4" />
          ) : null}
          {t("common:dir") === "ltr" ? <ArrowLeft className="h-4 w-4" /> : null}
          {t("common:back")}
        </Button>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t("loansPage.title")}</h1>
          <p className="text-gray-600">
            {t("loansPage.subtitle")}
          </p>
        </div>

        <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)}
            variant="fullWidth"
            className="mb-6 bg-white rounded-lg shadow-sm"
        >
          <Tab label={`${t("loansPage.borrowing")} (${borrowerLoans.length})`} />
          <Tab label={`${t("loansPage.lending")} (${lenderLoans.length})`} />
        </Tabs>

        {/* Borrowing Tab */}
        {tab === 0 && (
          <Box>
            {borrowerLoans.length === 0 ? (
              <Card>
                <CardContent className="space-y-4 py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-300" />
                  <Typography color="textSecondary">{t("loansPage.noBorrowingRequests")}</Typography>
                </CardContent>
              </Card>
            ) : (
              borrowerLoans.map((loan) => renderLoanCard(loan, true))
            )}
          </Box>
        )}

        {/* Lending Tab */}
        {tab === 1 && (
          <Box>
            {lenderLoans.length === 0 ? (
              <Card>
                <CardContent className="space-y-4 py-12 text-center">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <Typography color="textSecondary">{t("loansPage.noLendingRequests")}</Typography>
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