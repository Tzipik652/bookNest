import { Card, CardHeader, CardContent, Skeleton } from "@mui/material";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { CardTitle, CardDescription } from "./ui/card";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Book } from "../types";

interface AdminBooksTableProps {
  books: Book[];
  isLoading?: boolean;
  userMap: Record<string, string>;
  handleEditBook: (bookId: string) => void;
  handleDeleteBook: (bookId: string) => void;
}
export const AdminBooksTable = ({books, isLoading, userMap,handleEditBook,handleDeleteBook}:AdminBooksTableProps) => {
    const navigate = useNavigate();
  return (
    <div>
      {/* --- Books Table Skeleton --- */}
      <Card id="total-books-section" className="mb-8 shadow-sm border-0">
        <CardHeader>
          <CardTitle>All Books Management</CardTitle>
          <CardDescription>
            View and manage all books in the library
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="hidden md:block rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Author
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Uploader
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </td>
                      </tr>
                    ))
                  : books?.map((book) => (
                      <tr
                        key={book._id}
                        className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{book.title}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {book.author}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            {book.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {userMap[book.user_id]}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(book.date_created).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/book/${book._id}`)}
                            >
                              <BookOpen className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditBook(book._id)}
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBook(book._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            <div className="md:hidden space-y-3">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))
                : books.map((book) => (
                    <div
                      key={book._id}
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {book.title}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            {book.author}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 shrink-0">
                          {book.category}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span>{userMap[book.user_id]}</span>
                        <span>
                          {new Date(book.date_created).toLocaleDateString(
                            "he-IL"
                          )}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => navigate(`/book/${book._id}`)}
                        >
                          <BookOpen className="h-3.5 w-3.5 ml-1" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleEditBook(book._id)}
                        >
                          <Edit className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleDeleteBook(book._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>{" "}
    </div>
  );
};
