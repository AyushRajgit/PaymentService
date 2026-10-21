package in.cper.backend.exceptions;

import in.cper.backend.dto.ExceptionDTOs;
import in.cper.backend.dto.ValidationExceptionDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandlerPaymentService {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationExceptionDTO> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String,String> listErrorMessage = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach((error)->listErrorMessage.put(error.getField(), error.getDefaultMessage()));

        ValidationExceptionDTO validationExceptionDTO = new ValidationExceptionDTO(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad field value",
                listErrorMessage,
                request.getRequestURI()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(validationExceptionDTO);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ExceptionDTOs> handleNotFoundException(NotFoundException e, HttpServletRequest request) {
        ExceptionDTOs exceptionDTOs = new ExceptionDTOs(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                e.getMessage(),
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exceptionDTOs);
    }

    @ExceptionHandler(InsufficientBalance.class)
    public ResponseEntity<ExceptionDTOs> handleInsufficientBalance(InsufficientBalance e, HttpServletRequest request) {
        ExceptionDTOs exceptionDTOs = new ExceptionDTOs(
                HttpStatus.UNPROCESSABLE_CONTENT.value(),
                HttpStatus.UNPROCESSABLE_CONTENT.getReasonPhrase(),
                e.getMessage(),
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(exceptionDTOs);
    }

    @ExceptionHandler(UserAccountNotFound.class)
    public ResponseEntity<ExceptionDTOs> handleInvalidUserAccount(UserAccountNotFound e, HttpServletRequest request) {
        ExceptionDTOs exceptionDTOs = new ExceptionDTOs(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                e.getMessage(),
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exceptionDTOs);
    }

    @ExceptionHandler(WrongPassKeyException.class)
    public ResponseEntity<ExceptionDTOs> handleWrongPassKeyException(WrongPassKeyException e, HttpServletRequest request) {
        ExceptionDTOs exceptionDTOs = new ExceptionDTOs(
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                e.getMessage(),
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(exceptionDTOs);
    }

}
