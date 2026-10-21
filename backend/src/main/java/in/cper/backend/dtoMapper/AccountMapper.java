package in.cper.backend.dtoMapper;

import in.cper.backend.dto.AccountRequestDTO;
import in.cper.backend.entity.AccountPassKey;
import in.cper.backend.entity.BankAccountDetailEntity;
import in.cper.backend.entity.CustomerEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AccountMapper {
    public BankAccountDetailEntity accountReqToBankAccount(AccountRequestDTO accountRequestDTO, CustomerEntity customer) {
        BankAccountDetailEntity account = new BankAccountDetailEntity();
        account.setBankName(accountRequestDTO.getBankName());
        account.setBankAccountNumber(accountRequestDTO.getBankAccountNumber());
        account.setAccountPassKey(new AccountPassKey(accountRequestDTO.getPassKey()));
        account.setCustomer(customer);
        account.setBalance(new BigDecimal("10000.00"));
        return account;
    }
}
