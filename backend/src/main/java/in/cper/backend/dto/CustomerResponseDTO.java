package in.cper.backend.dto;

import in.cper.backend.entity.BankAccountDetailEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
public class CustomerResponseDTO {
    private String Message;
    private String firstName;
    private String lastName;
    private String phoneNumber;
}
