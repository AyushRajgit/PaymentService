package in.cper.backend.exceptions;

public class WrongPassKeyException extends RuntimeException {
    public WrongPassKeyException(String message) {
        super(message);
    }
}
