package in.cper.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequestDTO {
    @NotBlank
    private String bankName;

    @Pattern(regexp = "\\d{8}", message = "Account number must contain exactly 8 digits")
    @NotBlank
    private String bankAccountNumber;

    @Min(value = 100000, message = "Pass key must contain exactly 6 digits")
    @Max(value = 999999, message = "Pass key must contain exactly 6 digits")
    @NotNull
    private Long passKey;
}
