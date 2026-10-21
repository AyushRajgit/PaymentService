package in.cper.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CustomerRequestDTO {
    @Size(min = 3, max = 20, message = "First name length must be atleast 3 and atmost 20")
    @NotBlank
    private String firstName;

    @Size(min = 3, max = 20, message = "Last name length must be atleast 3 and atmost 20")
    @NotBlank
    private String lastName;

    @Pattern(regexp = "\\d{10}", message = "Phone number must contain exactly 10 digits")
    @NotBlank
    private String phoneNumber;
}
