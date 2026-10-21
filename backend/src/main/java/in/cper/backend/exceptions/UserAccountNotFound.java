package in.cper.backend.exceptions;

public class UserAccountNotFound extends RuntimeException {
    public UserAccountNotFound(String message) {
        super(message);
    }
}
