package in.cper.backend.service;

import in.cper.backend.dto.StatementDTO;
import in.cper.backend.dtoMapper.StatementMapper;
import in.cper.backend.entity.CustomerEntity;
import in.cper.backend.entity.TransactionRecord;
import in.cper.backend.exceptions.NotFoundException;
import in.cper.backend.repository.CustomerRepository;
import in.cper.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StatementService {

    private TransactionRepository transactionRepository;
    private CustomerRepository customerRepository;
    private StatementMapper statementMapper;

    @Autowired
    public StatementService(TransactionRepository transactionRepository, CustomerRepository customerRepository, StatementMapper statementMapper) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
        this.statementMapper = statementMapper;
    }

    public List<StatementDTO> getStatement(int pageNo, int pageSize, String email) {
        CustomerEntity customer = customerRepository.findByOwner_Email(email).orElseThrow(
                () -> new NotFoundException("Customer with id:" + email + " not found")
        );

        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<TransactionRecord> page = transactionRepository.findBySenderCustomer_CustomerIdOrReceiverCustomer_CustomerId(
                customer.getCustomerId(), customer.getCustomerId(), pageable);

        List<StatementDTO> statementDTOs = new ArrayList<>();
        for (TransactionRecord transactionRecord : page.getContent()) {
            statementDTOs.add(statementMapper.transactionToStatementDTO(transactionRecord));
        }

        return statementDTOs;
    }
}
