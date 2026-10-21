package in.cper.backend.dtoMapper;

import in.cper.backend.dto.PaymentRequestDTO;
import in.cper.backend.dto.PaymentResponseDTO;
import in.cper.backend.entity.BankAccountDetailEntity;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponseDTO paymentMapper(BankAccountDetailEntity sender, BankAccountDetailEntity receiver) {
        return new  PaymentResponseDTO(
                "Payment successful!",
                "Paid to " + receiver.getBankAccountNumber() + " from " + sender.getBankAccountNumber(),
                sender.getBankName(),
                sender.getBankAccountNumber(),
                sender.getBalance()
        );
    }
}
