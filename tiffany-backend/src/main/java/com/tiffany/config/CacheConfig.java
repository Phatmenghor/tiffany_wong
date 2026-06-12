package com.tiffany.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.github.benmanes.caffeine.cache.Caffeine;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    @Bean
    public Caffeine<Object, Object> caffeineConfig() {
        log.info("Initializing Caffeine cache: maxSize=1000, expireAfterWrite=1h");
        return Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats();
    }

    @Bean
    public CacheManager cacheManager(Caffeine<Object, Object> caffeine) {
        log.info("Initializing CaffeineCacheManager");
        CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager();
        caffeineCacheManager.setCaffeine(caffeine);
        return caffeineCacheManager;
    }
}
