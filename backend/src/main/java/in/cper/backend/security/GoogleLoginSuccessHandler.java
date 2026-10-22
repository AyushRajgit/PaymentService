package in.cper.backend.security;

import in.cper.backend.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;

@Component
public class GoogleLoginSuccessHandler implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

    private final AuthService authService;
    private final String frontendSuccessUrl;

    public GoogleLoginSuccessHandler(
            AuthService authService,
            @Value("${frontend.oauth2-success-url}") String frontendSuccessUrl) {
        this.authService = authService;
        this.frontendSuccessUrl = frontendSuccessUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        try {
            if (!(authentication.getPrincipal() instanceof OidcUser googleUser)) {
                throw new IllegalStateException("Google login did not return an OpenID Connect user");
            }

            String jwt = authService.loginWithGoogle(googleUser);
            invalidateOAuthSession(request);
            response.setHeader("Cache-Control", "no-store");
            response.setHeader("Referrer-Policy", "no-referrer");
            response.sendRedirect(frontendSuccessUrl + "#token=" + jwt);
        } catch (RuntimeException exception) {
            onAuthenticationFailure(request, response, new org.springframework.security.authentication.AuthenticationServiceException(
                    "Google sign-in could not be completed", exception));
        }
    }

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        invalidateOAuthSession(request);
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.sendRedirect(buildRedirect("error", "google_login_failed"));
    }

    private String buildRedirect(String parameter, String value) {
        URI uri = UriComponentsBuilder.fromUriString(frontendSuccessUrl)
                .queryParam(parameter, value)
                .build()
                .encode()
                .toUri();
        return uri.toString();
    }

    private void invalidateOAuthSession(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
