# 片段

## 统一返回类

```java
@AllArgsConstructor
@Getter
public enum StatusCode {
    SUCCESS(200, "success"),
    ERROR(500, "error"),
    NOT_FOUND(404, "资源未找到");

    private final int code;
    private final String message;
}
```

```java
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseData<T> {

    private int code;
    private String message;
    private T data;

    /**
     * 成功响应 - 默认状态码和消息
     */
    public static <T> ResponseData<T> success(T data) {
        return ResponseData.<T>builder()
                .code(StatusCode.SUCCESS.getCode())
                .message(StatusCode.SUCCESS.getMessage())
                .data(data)
                .build();
    }

    /**
     * 成功响应 - 无数据
     */
    public static <T> ResponseData<T> success() {
        return ResponseData.<T>builder()
                .code(StatusCode.SUCCESS.getCode())
                .message(StatusCode.SUCCESS.getMessage())
                .build();
    }

    /**
     * 错误响应 - 默认状态码和消息，可以携带数据
     */
    public static <T> ResponseData<T> error(T data) {
        return ResponseData.<T>builder()
                .code(StatusCode.ERROR.getCode())
                .message(StatusCode.ERROR.getMessage())
                .data(data)
                .build();
    }

    /**
     * 错误响应 - 无参数，默认状态码500，消息为'error'
     */
    public static <T> ResponseData<T> error() {
        return ResponseData.<T>builder()
                .code(StatusCode.ERROR.getCode())
                .message(StatusCode.ERROR.getMessage())
                .build();
    }

    /**
     * 错误响应 - 自定义状态码和消息
     */
    public static <T> ResponseData<T> error(int code, String message) {
        return ResponseData.<T>builder()
                .code(code)
                .message(message)
                .build();
    }

    /**
     * 错误响应 - 自定义状态码、消息和数据
     */
    public static <T> ResponseData<T> error(int code, String message, T data) {
        return ResponseData.<T>builder()
                .code(code)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * StatusCode作为参数
     */
    public static <T> ResponseResult<T> success(StatusCode statusCode) {
        return ResponseResult.<T>builder()
                .code(statusCode.getCode())
                .message(statusCode.getMessage())
                .data(null)
                .build();
    }

    public static <T> ResponseResult<T> success(StatusCode statusCode, T data) {
        return ResponseResult.<T>builder()
                .code(statusCode.getCode())
                .message(statusCode.getMessage())
                .data(data)
                .build();
    }

    public static <T> ResponseResult<T> error(StatusCode statusCode) {
        return ResponseResult.<T>builder()
                .code(statusCode.getCode())
                .message(statusCode.getMessage())
                .data(null)
                .build();
    }
}
```
