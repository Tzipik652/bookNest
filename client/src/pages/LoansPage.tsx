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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { MessageCircle, BookOpen, User, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../store/useUserStore";
import { LoanStatus } from "../types";

export function LoansPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [borrowerLoans, setBorrowerLoans] = useState<Loan[]>([]);
  const [lenderLoans, setLenderLoans] = useState<Loan[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
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
      const loan = await approveLoan(loanId);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "ACTIVE":
        return "default";
      case "RETURNED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

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
            <Badge variant={getStatusBadgeVariant(loan.status)}>
              {t(`lending.${loan.status.toLowerCase()}`)}
            </Badge>
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
                variant="destructive"
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
        <div className="mb-8">
          <h1 className="mb-2">My Loans</h1>
          <p className="text-gray-600">
            Manage your borrowing and lending activities
          </p>
        </div>

        <Tabs defaultValue="borrowing" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="borrowing">
              Borrowing ({borrowerLoans.length})
            </TabsTrigger>
            <TabsTrigger value="lending">
              Lending ({lenderLoans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="borrowing" className="space-y-4 mt-6">
            {borrowerLoans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No borrowing requests yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Browse books and request to borrow from the community
                  </p>
                  <Button onClick={() => navigate("/")} className="mt-4">
                    Browse Books
                  </Button>
                </CardContent>
              </Card>
            ) : (
              borrowerLoans.map((loan) => renderLoanCard(loan, true))
            )}
          </TabsContent>

          <TabsContent value="lending" className="space-y-4 mt-6">
            {lenderLoans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No lending requests yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Make your books available for lending to start sharing
                  </p>
                  <Button
                    onClick={() => navigate("/my-books")}
                    className="mt-4"
                  >
                    My Books
                  </Button>
                </CardContent>
              </Card>
            ) : (
              lenderLoans.map((loan) => renderLoanCard(loan, false))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
