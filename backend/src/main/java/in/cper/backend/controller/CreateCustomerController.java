package in.cper.backend.controller;

import in.cper.backend.dto.*;
import in.cper.backend.service.CreateCustomerService;
import in.cper.backend.service.StatementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/amazonPay/Customer")
public class CreateCustomerController {

    private CreateCustomerService createCustomerService;
    private StatementService statementService;

    @Autowired
    public CreateCustomerController(CreateCustomerService createCustomerService, StatementService statementService) {
        this.createCustomerService = createCustomerService;
        this.statementService = statementService;
    }

    @PostMapping("/register")
    public ResponseEntity<CustomerResponseDTO> registerNewCustomer(@Valid @RequestBody CustomerRequestDTO customerRequestDTO, Authentication authentication) {
        CustomerResponseDTO newCustomer = createCustomerService.registerNewCustomer(customerRequestDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(newCustomer);
    }

    @PostMapping("/addAccount")
    public ResponseEntity<String> addAccount(@Valid @RequestBody AccountRequestDTO accountRequestDTO, Authentication authentication) {
        String response = createCustomerService.addAccount(accountRequestDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/getCustomer/{id}")
    public ResponseEntity<CustomerResponseDTO> getCustomer(Authentication authentication) {
        CustomerResponseDTO existingCustomer = createCustomerService.getCustomer(authentication.getName());
        return ResponseEntity.status(HttpStatus.OK).body(existingCustomer);
    }

    @GetMapping("/getAccountDetails/{id}")
    public ResponseEntity<Set<AccountDetailsDTO>> getAccountDetails(Authentication authentication) {
        Set<AccountDetailsDTO> accountDetails = createCustomerService.getAccountDetails(authentication.getName());
        return ResponseEntity.status(HttpStatus.OK).body(accountDetails);
    }

    @GetMapping("/statement")
    public ResponseEntity<List<StatementDTO>> getStatement(@RequestParam int pageNo, @RequestParam int pageSize, Authentication authentication) {
        List<StatementDTO> statement = statementService.getStatement(pageNo, pageSize, authentication.getName());
        return  ResponseEntity.status(HttpStatus.OK).body(statement);
    }

    @PatchMapping("/changePassKey")
    public ResponseEntity<String> updatePassKey(@RequestParam String
                                                            accountNumber, @RequestParam Long newPassKey, Authentication authentication) {
        createCustomerService.updatePassKey(accountNumber, newPassKey, authentication.getName());
        return ResponseEntity.status(HttpStatus.OK).body("success");
    }


}
