package com.tiffany.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.AuditorAware;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestTemplate;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@RequiredArgsConstructor
@Slf4j
public class ApplicationConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        log.info("Initializing ObjectMapper with JavaTimeModule (HH:mm format)");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalTime.class, new LocalTimeSerializer(timeFormatter));
        javaTimeModule.addDeserializer(LocalTime.class, new LocalTimeDeserializer(timeFormatter));

        return Jackson2ObjectMapperBuilder.json()
                .modules(javaTimeModule)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }

    @Bean
    public RestTemplate restTemplate() {
        log.info("Initializing RestTemplate");
        return new RestTemplate();
    }

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-task-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        log.info("Async task executor initialized: corePool={}, maxPool={}, queue={}",
                executor.getCorePoolSize(), executor.getMaxPoolSize(), 100);
        return executor;
    }

    @Bean
    public AuditorAware<String> auditorProvider() {
        log.info("Initializing Spring Security auditor provider");
        return new SpringSecurityAuditorAware();
    }

    public static class SpringSecurityAuditorAware implements AuditorAware<String> {
        @Override
        public Optional<String> getCurrentAuditor() {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                    "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.of("SYSTEM");
            }
            return Optional.of(authentication.getName());
        }
    }
}
