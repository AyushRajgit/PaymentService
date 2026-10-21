package in.cper.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ValidationExceptionDTO {
    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private Map<String, String> message;
    private String path;
}