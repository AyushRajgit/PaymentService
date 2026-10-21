package in.cper.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ExceptionDTOs {
    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;
}
