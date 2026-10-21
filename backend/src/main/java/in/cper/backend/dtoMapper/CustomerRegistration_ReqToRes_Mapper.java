package in.cper.backend.dtoMapper;

import in.cper.backend.dto.AccountDetailsDTO;
import in.cper.backend.dto.CustomerRequestDTO;
import in.cper.backend.dto.CustomerResponseDTO;
import in.cper.backend.entity.BankAccountDetailEntity;
import in.cper.backend.entity.CustomerEntity;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class CustomerRegistration_ReqToRes_Mapper {
    public CustomerResponseDTO entityToResMapper(CustomerEntity customerEntity) {
        CustomerResponseDTO res = new CustomerResponseDTO(
                "User created successfully! Enjoy our payment service receive assured cashback...",
                customerEntity.getFirstName(),
                customerEntity.getLastName(),
                customerEntity.getPhoneNumber()
        );
        return res;
    }

    public CustomerEntity reqToEntityMapper(CustomerRequestDTO req) {
        CustomerEntity customerEntity = new CustomerEntity(
                req.getFirstName(),
                req.getLastName(),
                req.getPhoneNumber(),
                new HashSet<>()
        );
        return customerEntity;
    }

    public Set<AccountDetailsDTO> entityToAccountResMapper(Set<BankAccountDetailEntity> bankAccountDetail) {
        Set<AccountDetailsDTO> res = new HashSet<>();
        for (BankAccountDetailEntity account : bankAccountDetail) {
            res.add(new AccountDetailsDTO(
                    account.getBankName(),
                    account.getBankAccountNumber(),
                    account.getBalance()
            ));
        }
        return res;
    }
}
