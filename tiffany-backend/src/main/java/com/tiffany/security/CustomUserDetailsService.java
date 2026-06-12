package com.tiffany.security;

import com.tiffany.features.auth.models.User;
import com.tiffany.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by username for authentication.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String userIdentifier) throws UsernameNotFoundException {
        log.debug("Loading user details: identifier={}", userIdentifier);
        User user = userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier)
                .orElseThrow(() -> {
                    log.warn("User not found during authentication: identifier={}", userIdentifier);
                    return new UsernameNotFoundException("User not found: " + userIdentifier);
                });

        log.debug("User details loaded: identifier={}, role={}", userIdentifier, user.getUserRole());
        return new org.springframework.security.core.userdetails.User(
                user.getUserIdentifier(),
                user.getPassword(),
                mapUserTypeToAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> mapUserTypeToAuthorities(User user) {
        // Map UserRole to Spring Security authorities for fine-grained access control
        if (user.getUserRole() != null) {
            return Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name())
            );
        }
        // Fallback to UserType if userRole is not set (for backwards compatibility)
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getUserType().name())
        );
    }
}