package in.cper.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class PaymentRequestDTO {
    @Pattern(regexp = "\\d{8}", message = "Account number must contain exactly 8 digits")
    @NotBlank
    private String sendersBankAccountNumber;

    @Pattern(regexp = "\\d{8}", message = "Account number must contain exactly 8 digits")
    @NotBlank
    private String recipientsBankAccountNumber;

    @Min(value = 100000, message = "Pass key must contain exactly 6 digits")
    @Max(value = 999999, message = "Pass key must contain exactly 6 digits")
    @NotNull
    private Long passKey;

    @NotNull
    @Positive
    private BigDecimal amount;
}
