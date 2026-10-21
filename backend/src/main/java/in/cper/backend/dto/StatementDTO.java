package in.cper.backend.dto;

import in.cper.backend.Enum.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class StatementDTO {
    private String transactionId;
    private String senderName;
    private String receiverName;
    private String senderPhoneNumber;
    private String receiverPhoneNumber;
    private LocalDateTime dateAndTime;
    private PaymentStatus status;
    private String sendersBankName;
    private String receiversBankName;
    private BigDecimal amount;
}
