package com.tiffany;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableTransactionManagement
@Slf4j
public class TiffanyApplication {

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Phnom_Penh"));
		SpringApplication.run(TiffanyApplication.class, args);
		log.info("Cambodia Tiffany Platform started successfully");
		log.info("Access points - App: http://localhost:8080  Swagger: http://localhost:8080/swagger-ui.html  Health: http://localhost:8080/actuator/health");
	}
}