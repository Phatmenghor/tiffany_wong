
package com.tiffany.exception.custom;

public class BusinessValidationException extends RuntimeException {
    public BusinessValidationException(String message) {
        super(message);
    }
    
    public BusinessValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}