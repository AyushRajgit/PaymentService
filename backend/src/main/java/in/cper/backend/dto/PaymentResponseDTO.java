package in.cper.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class PaymentResponseDTO {
    private String Message;
    private String transactionMessage;
    private String bankName;
    private String bankAccountNumber;
    private BigDecimal currentBalance;
}
