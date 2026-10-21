package in.cper.backend.dto;

import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class AccountDetailsDTO {
    private String bankName;
    private String bankAccountNumber;
    private BigDecimal balance;
}
