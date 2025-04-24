package com.example.bookshop.handlers;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import com.sap.cds.services.cds.CdsReadEventContext;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;
import cds.gen.catalogservice.CatalogService;
import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;

@Component
@ServiceName("CatalogService")
public class CatalogServiceHandler implements EventHandler {

    @On(event = "borrowBook")
    public void onBorrowBook(BorrowBookContext context) {
        Integer bookID = context.getBookID();
        String userId = context.getUserInfo().getId();

        // Fetch the book
        Optional<Books> bookOptional = context.run(
            Select.from(Books_.class).byId(bookID)
        ).first(Books.class);

        if (!bookOptional.isPresent()) {
            throw new ServiceException(ErrorStatuses.NOT_FOUND, "Book not found");
        }

        Books book = bookOptional.get();

        // Check if the book is in stock
        if (book.getStock() <= 0) {
            throw new ServiceException(ErrorStatuses.BAD_REQUEST, "Book is out of stock");
        }

        // Check the user's current borrowed books
        List<BorrowedBooks> borrowedBooks = context.run(
            Select.from(BorrowedBooks_.class)
                  .where(b -> b.userId().eq(userId))
        ).listOf(BorrowedBooks.class);

        if (borrowedBooks.size() >= 5) {
            throw new ServiceException(ErrorStatuses.BAD_REQUEST, "Borrowing limit reached");
        }

        // Update the book stock
        book.setStock(book.getStock() - 1);
        context.run(Update.entity(Books_.class).data(book));

        // Record the borrowed book
        BorrowedBooks newBorrow = BorrowedBooks.create();
        newBorrow.setBookId(bookID);
        newBorrow.setUserId(userId);
        context.run(Insert.into(BorrowedBooks_.class).entry(newBorrow));
    }
}