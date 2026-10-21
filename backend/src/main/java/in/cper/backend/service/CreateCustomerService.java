package in.cper.backend.service;

import in.cper.backend.dto.AccountDetailsDTO;
import in.cper.backend.dto.AccountRequestDTO;
import in.cper.backend.dto.CustomerRequestDTO;
import in.cper.backend.dto.CustomerResponseDTO;
import in.cper.backend.dtoMapper.AccountMapper;
import in.cper.backend.dtoMapper.CustomerRegistration_ReqToRes_Mapper;
import in.cper.backend.entity.BankAccountDetailEntity;
import in.cper.backend.entity.CustomerEntity;
import in.cper.backend.entity.CustomUserDetailsEntity;
import in.cper.backend.exceptions.NotFoundException;
import in.cper.backend.repository.BankAccountRepository;
import in.cper.backend.repository.CustomerRepository;
import in.cper.backend.repository.CustomUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
public class CreateCustomerService {

    private CustomerRepository customerRepository;
    private CustomUserRepository userRepository;
    private BankAccountRepository bankAccountRepository;
    private CustomerRegistration_ReqToRes_Mapper ReqRes_Mapper;
    private AccountMapper accountMapper;

    @Autowired
    public CreateCustomerService(CustomerRepository customerRepository, CustomUserRepository userRepository, BankAccountRepository bankAccountRepository,CustomerRegistration_ReqToRes_Mapper ReqRes_Mapper, AccountMapper accountMapper) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.ReqRes_Mapper = ReqRes_Mapper;
        this.accountMapper = accountMapper;
    }

    @Transactional
    public CustomerResponseDTO registerNewCustomer(CustomerRequestDTO customerRequestDTO, String email) {
        CustomUserDetailsEntity owner = userRepository.findByEmail(email).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found")
        );
        if (customerRepository.findByOwner_Email(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Customer profile already exists");
        }

        CustomerEntity customerEntity = ReqRes_Mapper.reqToEntityMapper(customerRequestDTO);
        customerEntity.setOwner(owner);
        CustomerEntity createdCustomer = customerRepository.save(customerEntity);
        CustomerResponseDTO responseDTO = ReqRes_Mapper.entityToResMapper(createdCustomer);
        return responseDTO;
    }

    public CustomerResponseDTO getCustomer(String email) {
        CustomerEntity existingCustomer = customerRepository.findByOwner_Email(email).orElseThrow(
                () ->  new NotFoundException("Customer with id:"+ email +"not found : while fetching")
        );
        CustomerResponseDTO responseDTO = ReqRes_Mapper.entityToResMapper(existingCustomer);
        return responseDTO;
    }

    public Set<AccountDetailsDTO> getAccountDetails(String email) {
        CustomerEntity existingCustomer = customerRepository.findByOwner_Email(email).orElseThrow(
                () ->  new NotFoundException("Customer with id:"+ email +"not found while fetching account details")
        );
        Set<AccountDetailsDTO> accountRes = ReqRes_Mapper.entityToAccountResMapper(existingCustomer.getBankAccounts());
        return accountRes;
    }

    @Transactional
    public void updatePassKey(String bankAccountNumber, Long newPassKey, String email) {
        CustomerEntity customer = customerRepository.findByOwner_Email(email).orElseThrow(
                () -> new NotFoundException("Customer with id:" + email + " not found")
        );
        if (newPassKey == null || newPassKey <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passkey must be positive");
        }

        BankAccountDetailEntity account = bankAccountRepository.findByBankAccountNumber(bankAccountNumber).orElseThrow(
                () ->  new NotFoundException("Account with id:"+ bankAccountNumber +" not found while changing passkey")
        );

        account.getAccountPassKey().setPassKey(newPassKey);
        bankAccountRepository.save(account);
    }

    @Transactional
    public String addAccount(AccountRequestDTO accountRequestDTO, String email) {
        CustomerEntity customer = customerRepository.findByOwner_Email(email).orElseThrow(
                () ->  new NotFoundException("Customer with id:"+ email +"not found")
        );

        BankAccountDetailEntity account = accountMapper.accountReqToBankAccount(accountRequestDTO, customer);
        customer.getBankAccounts().add(account);
        customerRepository.save(customer);

        return "Account created successfully";
    }
}
