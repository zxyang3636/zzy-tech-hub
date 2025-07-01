# 片段

## RSA 加解密

RSA 加密算法是一种非对称加密算法，即 RSA 拥有一对密钥（公钥 和 私钥），公钥可公开。公钥加密的数据，只能由私钥解密；私钥加密的数据只能由公钥解密。

用生活例子理解 RSA
想象一下邮箱和钥匙的例子：

```
传统方式（对称加密）：
你和朋友共用一个邮箱，你们俩都有同一把钥匙
问题：如何安全地把钥匙给朋友？

RSA方式（非对称加密）：
你有一个特殊的邮箱：
- 投递口（公钥）：任何人都可以往里投信
- 取信钥匙（私钥）：只有你有，只有你能取信

流程：
1. 你把邮箱地址告诉所有人（公钥公开）
2. 朋友用投递口投信（用公钥加密）
3. 只有你能用钥匙取信（用私钥解密）
```

**RSA 的核心特点**

```
公钥（Public Key）：
- 可以公开给任何人
- 用来加密数据
- 就像邮箱的投递口

私钥（Private Key）：
- 绝对保密，只有自己知道
- 用来解密数据
- 就像邮箱的钥匙

神奇之处：
公钥加密的数据，只有对应的私钥才能解密！
```

**RSA 的优缺点**

✅ 优点

1. 安全性极高：基于数学难题,"大数分解"
2. 密钥分发简单：公钥可以公开传输
3. 支持数字签名：可以验证身份

❌ 缺点

1. 速度慢：比 AES 慢 100-1000 倍
2. 数据大小限制：只能加密小数据（通常<245 字节）
3. 计算复杂：需要大量 CPU 资源
4. 密钥长度大：通常需要 2048 位以上

---

登录加解密流程
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-07-01_14-54-52.png)

**RSA 工具类**

```java
package com.example.utils;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;

import javax.crypto.Cipher;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

/**
 * RSA加解密工具类
 *
 * 这是整个RSA加解密的核心工具类
 * 包含了RSA密钥对生成、加密、解密的所有核心方法
 *
 * @author YourName
 */
@Slf4j
public class RSAUtils {

    /**
     * RSA算法名称
     */
    private static final String ALGORITHM = "RSA";

    /**
     * RSA密钥长度，2048位是目前推荐的安全长度
     * 1024位已经不够安全，4096位太慢，2048位是最佳选择
     */
    private static final int KEY_SIZE = 2048;

    /**
     * RSA加密填充方式
     * PKCS1Padding是最常用的填充方式
     */
    private static final String TRANSFORMATION = "RSA/ECB/PKCS1Padding";

    /**
     * 生成RSA密钥对
     *
     * 这个方法会生成一对RSA密钥：公钥和私钥
     * 公钥用于加密，私钥用于解密
     *
     * @return KeyPair 包含公钥和私钥的密钥对
     * @throws Exception 生成失败时抛出异常
     */
    public static KeyPair generateKeyPair() throws Exception {
        log.info("🔑 开始生成RSA密钥对，密钥长度: {} 位", KEY_SIZE);

        try {
            // 1. 获取RSA算法的密钥对生成器
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(ALGORITHM);

            // 2. 设置密钥长度
            keyPairGenerator.initialize(KEY_SIZE);

            // 3. 生成密钥对
            KeyPair keyPair = keyPairGenerator.generateKeyPair();

            log.info("✅ RSA密钥对生成成功");
            return keyPair;

        } catch (Exception e) {
            log.error("❌ RSA密钥对生成失败: {}", e.getMessage(), e);
            throw new Exception("RSA密钥对生成失败", e);
        }
    }

    /**
     * 将公钥转换为字符串格式
     *
     * 公钥需要传给前端，所以要转换为字符串格式
     * 使用PEM格式，这是业界标准格式
     *
     * @param publicKey 公钥对象
     * @return String PEM格式的公钥字符串
     */
    public static String publicKeyToString(PublicKey publicKey) {
        log.debug("🔄 开始转换公钥为字符串格式");

        try {
            // 1. 获取公钥的字节数组
            byte[] publicKeyBytes = publicKey.getEncoded();

            // 2. 转换为Base64字符串
            String publicKeyBase64 = Base64.encodeBase64String(publicKeyBytes);

            // 3. 构建PEM格式的公钥字符串
            StringBuilder pemFormat = new StringBuilder();
            pemFormat.append("-----BEGIN PUBLIC KEY-----\n");

            // 4. 每64个字符换一行（PEM格式标准）
            for (int i = 0; i < publicKeyBase64.length(); i += 64) {
                int endIndex = Math.min(i + 64, publicKeyBase64.length());
                pemFormat.append(publicKeyBase64, i, endIndex).append("\n");
            }

            pemFormat.append("-----END PUBLIC KEY-----");

            String result = pemFormat.toString();
            log.debug("✅ 公钥转换完成，长度: {} 字符", result.length());

            return result;

        } catch (Exception e) {
            log.error("❌ 公钥转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("公钥转换失败", e);
        }
    }

    /**
     * 将私钥转换为字符串格式
     *
     * 注意：私钥字符串只在服务器内部使用，绝对不能暴露给外部
     *
     * @param privateKey 私钥对象
     * @return String PEM格式的私钥字符串
     */
    public static String privateKeyToString(PrivateKey privateKey) {
        log.debug("🔄 开始转换私钥为字符串格式");

        try {
            byte[] privateKeyBytes = privateKey.getEncoded();
            String privateKeyBase64 = Base64.encodeBase64String(privateKeyBytes);

            StringBuilder pemFormat = new StringBuilder();
            pemFormat.append("-----BEGIN PRIVATE KEY-----\n");

            for (int i = 0; i < privateKeyBase64.length(); i += 64) {
                int endIndex = Math.min(i + 64, privateKeyBase64.length());
                pemFormat.append(privateKeyBase64, i, endIndex).append("\n");
            }

            pemFormat.append("-----END PRIVATE KEY-----");

            String result = pemFormat.toString();
            log.debug("✅ 私钥转换完成，长度: {} 字符", result.length());

            return result;

        } catch (Exception e) {
            log.error("❌ 私钥转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("私钥转换失败", e);
        }
    }

    /**
     * 从字符串还原公钥对象
     *
     * 用于从PEM格式的字符串还原公钥对象
     * 主要用于测试和某些特殊场景
     *
     * @param publicKeyString PEM格式的公钥字符串
     * @return PublicKey 公钥对象
     * @throws Exception 还原失败时抛出异常
     */
    public static PublicKey stringToPublicKey(String publicKeyString) throws Exception {
        log.debug("🔄 开始从字符串还原公钥对象");

        try {
            // 1. 移除PEM格式的头尾标识和换行符
            String publicKeyPEM = publicKeyString
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");

            // 2. 解码Base64字符串
            byte[] publicKeyBytes = Base64.decodeBase64(publicKeyPEM);

            // 3. 创建公钥规格对象
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);

            // 4. 获取RSA密钥工厂
            KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);

            // 5. 生成公钥对象
            PublicKey publicKey = keyFactory.generatePublic(keySpec);

            log.debug("✅ 公钥对象还原成功");
            return publicKey;

        } catch (Exception e) {
            log.error("❌ 公钥对象还原失败: {}", e.getMessage(), e);
            throw new Exception("公钥对象还原失败", e);
        }
    }

    /**
     * 从字符串还原私钥对象
     *
     * @param privateKeyString PEM格式的私钥字符串
     * @return PrivateKey 私钥对象
     * @throws Exception 还原失败时抛出异常
     */
    public static PrivateKey stringToPrivateKey(String privateKeyString) throws Exception {
        log.debug("🔄 开始从字符串还原私钥对象");

        try {
            String privateKeyPEM = privateKeyString
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");

            byte[] privateKeyBytes = Base64.decodeBase64(privateKeyPEM);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);

            PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

            log.debug("✅ 私钥对象还原成功");
            return privateKey;

        } catch (Exception e) {
            log.error("❌ 私钥对象还原失败: {}", e.getMessage(), e);
            throw new Exception("私钥对象还原失败", e);
        }
    }

    /**
     * 使用公钥加密数据
     *
     * 这是前端会用到的加密过程的后端等价实现
     * 主要用于测试和验证
     *
     * @param data 要加密的原始数据
     * @param publicKey 公钥对象
     * @return String Base64编码的加密结果
     * @throws Exception 加密失败时抛出异常
     */
    public static String encryptByPublicKey(String data, PublicKey publicKey) throws Exception {
        log.debug("🔒 开始使用公钥加密数据，数据长度: {} 字符", data.length());

        try {
            // 1. 创建加密器
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            // 2. 用公钥初始化加密器
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);

            // 3. 将字符串转换为字节数组
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);

            // 4. 执行加密
            byte[] encryptedBytes = cipher.doFinal(dataBytes);

            // 5. 转换为Base64字符串
            String encryptedData = Base64.encodeBase64String(encryptedBytes);

            log.debug("✅ 公钥加密成功，加密后长度: {} 字符", encryptedData.length());
            return encryptedData;

        } catch (Exception e) {
            log.error("❌ 公钥加密失败: {}", e.getMessage(), e);
            throw new Exception("公钥加密失败", e);
        }
    }

    /**
     * 使用私钥解密数据
     *
     * 这是后端的核心解密方法
     * 用于解密前端发送的加密数据
     *
     * @param encryptedData Base64编码的加密数据
     * @param privateKey 私钥对象
     * @return String 解密后的原始数据
     * @throws Exception 解密失败时抛出异常
     */
    public static String decryptByPrivateKey(String encryptedData, PrivateKey privateKey) throws Exception {
        log.debug("🔓 开始使用私钥解密数据，加密数据长度: {} 字符", encryptedData.length());

        try {
            // 1. 创建解密器
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            // 2. 用私钥初始化解密器
            cipher.init(Cipher.DECRYPT_MODE, privateKey);

            // 3. 将Base64字符串解码为字节数组
            byte[] encryptedBytes = Base64.decodeBase64(encryptedData);

            // 4. 执行解密
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

            // 5. 转换为字符串
            String decryptedData = new String(decryptedBytes, StandardCharsets.UTF_8);

            log.debug("✅ 私钥解密成功，解密后长度: {} 字符", decryptedData.length());
            return decryptedData;

        } catch (Exception e) {
            log.error("❌ 私钥解密失败: {}", e.getMessage(), e);
            throw new Exception("私钥解密失败", e);
        }
    }

    /**
     * 验证RSA密钥对是否匹配
     *
     * 通过加密-解密测试来验证公钥和私钥是否为一对
     *
     * @param publicKey 公钥
     * @param privateKey 私钥
     * @return boolean true表示匹配，false表示不匹配
     */
    public static boolean verifyKeyPair(PublicKey publicKey, PrivateKey privateKey) {
        log.debug("🔍 开始验证RSA密钥对匹配性");

        try {
            // 测试数据
            String testData = "RSA KeyPair Test: " + System.currentTimeMillis();

            // 用公钥加密
            String encrypted = encryptByPublicKey(testData, publicKey);

            // 用私钥解密
            String decrypted = decryptByPrivateKey(encrypted, privateKey);

            // 比较原文和解密结果
            boolean isMatch = testData.equals(decrypted);

            if (isMatch) {
                log.debug("✅ RSA密钥对验证成功：公钥和私钥匹配");
            } else {
                log.warn("❌ RSA密钥对验证失败：公钥和私钥不匹配");
            }

            return isMatch;

        } catch (Exception e) {
            log.error("❌ RSA密钥对验证异常: {}", e.getMessage(), e);
            return false;
        }
    }
}
```

**RSA 密钥管理服务**

```java
package com.demo.zzy.service;

import com.demo.zzy.utils.RSAUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.UUID;

/**
 * @author zzy
 * @description: TODO
 * @date 2025/7/1
 */
/**
 * RSA密钥管理服务
 *
 * 这个服务负责：
 * 1. 生成和管理RSA密钥对
 * 2. 提供公钥给前端
 * 3. 使用私钥解密前端数据
 * 4. 定期更换密钥（可选）
 */
@Service
@Slf4j
public class RSAKeyService {
    /**
     * 当前使用的RSA密钥对
     */
    private KeyPair currentKeyPair;

    /**
     * 当前密钥的唯一标识ID
     * 用于标识不同批次的密钥，方便管理和调试
     */
    private String currentKeyId;

    /**
     * 服务启动时自动初始化密钥对
     *
     * @PostConstruct 注解确保在Spring容器创建Bean后立即执行
     */
    @PostConstruct
    public void initializeKeys() {
        log.info("🚀 RSA密钥服务开始初始化...");

        try {
            // 生成新的密钥对
            generateNewKeyPair();

            // 验证密钥对是否正常
            if (verifyCurrentKeyPair()) {
                log.info("🎉 RSA密钥服务初始化成功！");
                log.info("📊 密钥信息：");
                log.info("   - 密钥ID: {}", currentKeyId);
                log.info("   - 算法: RSA");
                log.info("   - 密钥长度: 2048位");
                log.info("   - 公钥长度: {} 字符", getPublicKeyString().length());
            } else {
                throw new RuntimeException("密钥对验证失败");
            }

        } catch (Exception e) {
            log.error("❌ RSA密钥服务初始化失败: {}", e.getMessage(), e);
            throw new RuntimeException("RSA密钥服务初始化失败", e);
        }
    }

    /**
     * 生成新的RSA密钥对
     *
     * @throws Exception 生成失败时抛出异常
     */
    private void generateNewKeyPair() throws Exception {
        log.info("🔑 开始生成新的RSA密钥对...");

        // 1. 生成密钥对
        this.currentKeyPair = RSAUtils.generateKeyPair();

        // 2. 生成新的密钥ID
        this.currentKeyId = "RSA-" + UUID.randomUUID().toString();

        log.info("✅ 新密钥对生成完成，密钥ID: {}", currentKeyId);
    }

    /**
     * 验证当前密钥对是否正常
     *
     * @return boolean 验证结果
     */
    private boolean verifyCurrentKeyPair() {
        if (currentKeyPair == null) {
            log.error("❌ 密钥对为空，验证失败");
            return false;
        }

        log.info("🔍 开始验证密钥对...");

        try {
            PublicKey publicKey = currentKeyPair.getPublic();
            PrivateKey privateKey = currentKeyPair.getPrivate();

            // 使用RSAUtils的验证方法
            boolean isValid = RSAUtils.verifyKeyPair(publicKey, privateKey);

            if (isValid) {
                log.info("✅ 密钥对验证成功");
            } else {
                log.error("❌ 密钥对验证失败");
            }

            return isValid;

        } catch (Exception e) {
            log.error("❌ 密钥对验证异常: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 获取当前公钥的字符串格式
     *
     * 这个方法会被Controller调用，返回给前端使用
     *
     * @return String PEM格式的公钥字符串
     */
    public String getPublicKeyString() {
        if (currentKeyPair == null) {
            throw new RuntimeException("密钥对未初始化");
        }

        try {
            PublicKey publicKey = currentKeyPair.getPublic();
            String publicKeyString = RSAUtils.publicKeyToString(publicKey);

            log.debug("📤 提供公钥字符串，长度: {} 字符", publicKeyString.length());
            return publicKeyString;

        } catch (Exception e) {
            log.error("❌ 获取公钥字符串失败: {}", e.getMessage(), e);
            throw new RuntimeException("获取公钥字符串失败", e);
        }
    }

    /**
     * 获取当前密钥ID
     *
     * @return String 密钥ID
     */
    public String getCurrentKeyId() {
        return currentKeyId;
    }

    /**
     * 使用当前私钥解密数据
     *
     * 这是最核心的方法，用于解密前端发送的加密数据
     *
     * @param encryptedData Base64编码的加密数据
     * @return String 解密后的原始数据
     * @throws Exception 解密失败时抛出异常
     */
    public String decryptData(String encryptedData) throws Exception {
        if (currentKeyPair == null) {
            throw new RuntimeException("密钥对未初始化");
        }

        log.debug("🔓 开始解密数据...");
        log.debug("📥 接收到加密数据，长度: {} 字符", encryptedData.length());

        try {
            PrivateKey privateKey = currentKeyPair.getPrivate();
            String decryptedData = RSAUtils.decryptByPrivateKey(encryptedData, privateKey);

            log.debug("✅ 数据解密成功");
            log.debug("📤 解密结果长度: {} 字符", decryptedData.length());

            return decryptedData;

        } catch (Exception e) {
            log.error("❌ 数据解密失败: {}", e.getMessage(), e);
            throw new Exception("数据解密失败: " + e.getMessage(), e);
        }
    }

    /**
     * 使用当前公钥加密数据
     *
     * 主要用于测试目的，模拟前端加密过程
     *
     * @param data 要加密的原始数据
     * @return String Base64编码的加密结果
     * @throws Exception 加密失败时抛出异常
     */
    public String encryptData(String data) throws Exception {
        if (currentKeyPair == null) {
            throw new RuntimeException("密钥对未初始化");
        }

        log.debug("🔒 开始加密数据...");
        log.debug("📥 原始数据长度: {} 字符", data.length());

        try {
            PublicKey publicKey = currentKeyPair.getPublic();
            String encryptedData = RSAUtils.encryptByPublicKey(data, publicKey);

            log.debug("✅ 数据加密成功");
            log.debug("📤 加密结果长度: {} 字符", encryptedData.length());

            return encryptedData;

        } catch (Exception e) {
            log.error("❌ 数据加密失败: {}", e.getMessage(), e);
            throw new Exception("数据加密失败: " + e.getMessage(), e);
        }
    }

    /**
     * 手动更换密钥对
     *
     * 可以在运行时调用此方法更换密钥，提高安全性
     *
     * @return String 新的密钥ID
     * @throws Exception 更换失败时抛出异常
     */
    public String rotateKeys() throws Exception {
        log.info("🔄 开始手动更换RSA密钥对...");

        String oldKeyId = currentKeyId;

        try {
            // 生成新密钥对
            generateNewKeyPair();

            // 验证新密钥对
            if (!verifyCurrentKeyPair()) {
                throw new Exception("新密钥对验证失败");
            }

            log.info("✅ RSA密钥对更换成功");
            log.info("🔄 旧密钥ID: {} → 新密钥ID: {}", oldKeyId, currentKeyId);

            return currentKeyId;

        } catch (Exception e) {
            log.error("❌ RSA密钥对更换失败: {}", e.getMessage(), e);
            throw new Exception("RSA密钥对更换失败", e);
        }
    }

    /**
     * 执行RSA加解密完整测试
     *
     * 用于验证整个RSA加解密流程是否正常
     *
     * @return boolean 测试结果
     */
    public boolean performFullTest() {
        log.info("🧪 开始执行RSA完整功能测试...");

        try {
            // 测试数据
            String originalData = "RSA Full Test: Hello World! 测试中文 " + System.currentTimeMillis();
            log.info("📝 测试数据: {}", originalData);

            // 1. 加密测试
            String encryptedData = encryptData(originalData);
            log.info("🔒 加密结果: {}...", encryptedData.substring(0, Math.min(50, encryptedData.length())));

            // 2. 解密测试
            String decryptedData = decryptData(encryptedData);
            log.info("🔓 解密结果: {}", decryptedData);

            // 3. 验证结果
            boolean testPassed = originalData.equals(decryptedData);

            if (testPassed) {
                log.info("🎉 RSA完整功能测试通过！");
            } else {
                log.error("❌ RSA完整功能测试失败！原文和解密结果不匹配");
            }

            return testPassed;

        } catch (Exception e) {
            log.error("❌ RSA完整功能测试异常: {}", e.getMessage(), e);
            return false;
        }
    }

}

```

**RSA 控制器**

```java
package com.demo.zzy.controller.pure;

import com.demo.zzy.pojo.dto.PublicKeyResponse;
import com.demo.zzy.service.RSAKeyService;
import com.demo.zzy.utils.ResponseData;
import kotlin.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * @author zzy
 * @description: TODO
 * @date 2025/7/1
 */
@RestController
@RequestMapping("/rsa")
@Slf4j
public class RSAController {

    @Autowired
    private RSAKeyService rsaKeyService;

    /**
     * 获取RSA公钥
     * <p>
     * 前端调用此接口获取公钥，用于加密敏感数据
     * <p>
     * GET /api/rsa/public-key
     *
     * @return Result<PublicKeyResponse> 包含公钥信息的响应
     */
    @GetMapping("/public-key")
    public ResponseData<?> getPublicKey() {
        log.info("🔑 收到获取公钥请求");

        try {
            // 1. 获取公钥字符串
            String publicKeyString = rsaKeyService.getPublicKeyString();

            // 2. 获取密钥ID
            String keyId = rsaKeyService.getCurrentKeyId();

            // 3. 构建响应对象
            PublicKeyResponse response = PublicKeyResponse.builder()
                    .publicKey(publicKeyString)
                    .keyId(keyId)
                    .timestamp(System.currentTimeMillis())
                    .algorithm("RSA")
                    .keySize(2048)
                    .build();

            log.info("✅ 公钥获取成功，密钥ID: {}", keyId);
            log.debug("📏 公钥长度: {} 字符", publicKeyString.length());

            return ResponseData.success(response);

        } catch (Exception e) {
            log.error("❌ 获取公钥失败: {}", e.getMessage(), e);
            return ResponseData.error("获取公钥失败: " + e.getMessage());
        }
    }

    /**
     * 手动更换RSA密钥
     * <p>
     * 触发密钥轮换，生成新的密钥对
     * <p>
     * POST /api/rsa/rotate-keys
     *
     * @return Result<Map < String, Object>> 更换结果
     */
    @PostMapping("/rotate-keys")
    public ResponseData<?> rotateKeys() {
        log.info("🔄 收到密钥轮换请求");

        try {
            String oldKeyId = rsaKeyService.getCurrentKeyId();
            String newKeyId = rsaKeyService.rotateKeys();

            Map<String, Object> response = new HashMap<>();
            response.put("oldKeyId", oldKeyId);
            response.put("newKeyId", newKeyId);
            response.put("timestamp", System.currentTimeMillis());
            response.put("message", "密钥轮换成功");

            log.info("✅ 密钥轮换成功: {} → {}", oldKeyId, newKeyId);
            return ResponseData.success(response);

        } catch (Exception e) {
            log.error("❌ 密钥轮换失败: {}", e.getMessage(), e);
            return ResponseData.error("密钥轮换失败: " + e.getMessage());
        }
    }

}

```

**认证控制器（RSA 登录示例）**

```java
package com.demo.zzy.controller.pure;

import com.demo.zzy.pojo.dto.LoginRequest;
import com.demo.zzy.service.RSAKeyService;
import com.demo.zzy.utils.ResponseData;
import kotlin.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * @author zzy
 * @description: TODO
 * @date 2025/7/1
 */
@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {
    @Autowired
    private RSAKeyService rsaKeyService;

    /**
     * RSA加密登录
     * <p>
     * 接收前端发送的用户名和RSA加密后的密码
     *
     * @param request 登录请求（密码已加密）
     * @return Result<Map < String, Object>> 登录结果
     */
    @PostMapping("/login")
    public ResponseData<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("🔐 收到加密登录请求");
        log.info("👤 用户名: {}", request.getUsername());
        log.info("🔒 加密密码长度: {} 字符", request.getPassword().length());
        log.info("⏰ 请求时间戳: {}", request.getTimestamp());

        try {
            // 1. 验证时间戳（防重放攻击）
            long currentTime = System.currentTimeMillis();
            long timeDiff = Math.abs(currentTime - request.getTimestamp());

            if (timeDiff > 5 * 60 * 1000) { // 5分钟有效期
                log.warn("⚠️ 请求时间戳无效，时间差: {}ms", timeDiff);
                return ResponseData.error("请求已过期，请重新登录");
            }

            // 2. 使用RSA私钥解密密码
            log.info("🔓 开始解密用户密码...");
            String plainPassword = rsaKeyService.decryptData(request.getPassword());
            log.info("✅ 密码解密成功");
            log.debug("🔓 解密后密码长度: {} 字符", plainPassword.length());

            // 3. 验证用户名和密码（这里用简单的示例逻辑）
            boolean loginSuccess = validateUser(request.getUsername(), plainPassword);

            if (loginSuccess) {
                // 4. 登录成功，生成响应
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("username", request.getUsername());
                response.put("token", "mock-jwt-token-" + System.currentTimeMillis());
                response.put("message", "登录成功");
                response.put("loginTime", System.currentTimeMillis());

                log.info("🎉 用户登录成功: {}", request.getUsername());
                return ResponseData.success(response);

            } else {
                log.warn("❌ 用户登录失败: {}", request.getUsername());
                return ResponseData.error("用户名或密码错误");
            }

        } catch (Exception e) {
            log.error("❌ 登录处理异常: {}", e.getMessage(), e);
            return ResponseData.error("登录失败: " + e.getMessage());
        } finally {
            // 5. 安全清理：清空可能包含明文密码的变量
            request.setPassword(null);
        }
    }

    /**
     * 简单的用户验证逻辑（示例）
     * 实际项目中应该连接数据库验证
     */
    private boolean validateUser(String username, String password) {
        log.info("🔍 验证用户: {}", username);

        // 示例：简单的用户验证
        if ("admin".equals(username) && "123456".equals(password)) {
            return true;
        }
        if ("user".equals(username) && "password".equals(password)) {
            return true;
        }
        if ("test".equals(username) && "test123".equals(password)) {
            return true;
        }

        return false;
    }

}

```

**使用场景：**

- 🔐 用户登录密码加密传输
- 📧 敏感信息加密存储
- 🔑 API 密钥安全传输
- 💳 支付信息加密处理

为什么要在服务启动时自动初始化 RSA 密钥？

RSA 密钥生成耗时较长

测试时间：

```
RSA-1024位: ~50-100ms
RSA-2048位: ~200-500ms  ← 我们用的
RSA-4096位: ~1-3秒
```

用户体验：

```
用户A (第一个请求): 等待500ms ❌ 体验差
用户B (后续请求):   立即响应   ✅ 体验好
```

**前端**
创建 RSA 工具类

```ts [RSAUtils]
// src/utils/rsa.ts
import JSEncrypt from "jsencrypt";
import { ElMessage } from "element-plus";

/**
 * RSA加密工具类
 * 统一管理RSA公钥获取和数据加密
 */
export class RSAUtils {
  // 单例模式，全局只有一个实例
  private static instance: RSAUtils | null = null;

  // 存储公钥信息
  private publicKey: string | null = null;
  private keyId: string | null = null;
  private lastUpdateTime: number = 0;

  // 配置参数
  private readonly API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  private readonly KEY_CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存

  /**
   * 获取RSA工具实例（单例模式）
   */
  public static getInstance(): RSAUtils {
    if (!RSAUtils.instance) {
      RSAUtils.instance = new RSAUtils();
    }
    return RSAUtils.instance;
  }

  /**
   * 私有构造函数，防止外部直接创建实例
   */
  private constructor() {
    console.log("🔐 RSAUtils实例已创建");
  }

  /**
   * 获取RSA公钥
   * 带缓存机制，避免频繁请求
   */
  private async getPublicKey(): Promise<string> {
    console.log("🔑 开始获取RSA公钥...");

    // 检查缓存是否有效
    const now = Date.now();
    if (this.publicKey && now - this.lastUpdateTime < this.KEY_CACHE_DURATION) {
      console.log("✅ 使用缓存的公钥，密钥ID:", this.keyId);
      return this.publicKey;
    }

    try {
      console.log("🌐 从服务器获取新的公钥...");

      const response = await fetch(`${this.API_BASE}/api/rsa/public-key`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || "获取公钥失败");
      }

      // 更新缓存
      this.publicKey = result.data.publicKey;
      this.keyId = result.data.keyId;
      this.lastUpdateTime = now;

      console.log("✅ 公钥获取成功:");
      console.log("   - 密钥ID:", this.keyId);
      console.log("   - 算法:", result.data.algorithm);
      console.log("   - 密钥长度:", result.data.keySize, "位");

      return this.publicKey;
    } catch (error: any) {
      console.error("❌ 获取公钥失败:", error);
      throw new Error(`获取公钥失败: ${error.message}`);
    }
  }

  /**
   * 使用RSA公钥加密数据
   * @param data 要加密的数据
   * @returns Promise<string> 加密后的Base64字符串
   */
  public async encrypt(data: string): Promise<string> {
    if (!data) {
      throw new Error("加密数据不能为空");
    }

    console.log("🔒 开始RSA加密数据...");
    console.log("   - 原始数据长度:", data.length);

    try {
      // 1. 获取公钥
      const publicKey = await this.getPublicKey();

      // 2. 创建加密器
      const jsEncrypt = new JSEncrypt();
      jsEncrypt.setPublicKey(publicKey);

      // 3. 执行加密
      const encrypted = jsEncrypt.encrypt(data);

      if (!encrypted) {
        throw new Error("RSA加密失败，返回空值");
      }

      console.log("✅ RSA加密成功:");
      console.log("   - 加密后长度:", encrypted.length);
      console.log("   - 使用密钥ID:", this.keyId);

      return encrypted;
    } catch (error: any) {
      console.error("❌ RSA加密失败:", error);
      throw new Error(`RSA加密失败: ${error.message}`);
    }
  }

  /**
   * 批量加密多个字段
   * @param data 要加密的数据对象
   * @param fields 需要加密的字段名数组
   * @returns Promise<any> 加密后的数据对象
   */
  public async encryptFields(data: any, fields: string[]): Promise<any> {
    console.log("🔒 开始批量加密字段:", fields);

    const result = { ...data };

    for (const field of fields) {
      if (data[field]) {
        result[field] = await this.encrypt(data[field]);
        console.log(`✅ 字段 ${field} 加密完成`);
      }
    }

    return result;
  }

  /**
   * 验证公钥是否有效
   */
  public async validatePublicKey(): Promise<boolean> {
    try {
      await this.getPublicKey();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清除缓存的公钥（强制重新获取）
   */
  public clearCache(): void {
    console.log("🧹 清除RSA公钥缓存");
    this.publicKey = null;
    this.keyId = null;
    this.lastUpdateTime = 0;
  }

  /**
   * 获取当前状态信息
   */
  public getStatus() {
    return {
      hasPublicKey: !!this.publicKey,
      keyId: this.keyId,
      lastUpdateTime: this.lastUpdateTime,
      cacheValid: Date.now() - this.lastUpdateTime < this.KEY_CACHE_DURATION,
    };
  }

  // 静态方法，方便直接调用
  public static async encrypt(data: string): Promise<string> {
    return RSAUtils.getInstance().encrypt(data);
  }

  public static async encryptFields(data: any, fields: string[]): Promise<any> {
    return RSAUtils.getInstance().encryptFields(data, fields);
  }

  public static clearCache(): void {
    RSAUtils.getInstance().clearCache();
  }
}

// 导出实例，也可以直接使用
export const rsaUtils = RSAUtils.getInstance();
```

```vue
<template>
  <div class="login_container">
    <el-row>
      <el-col :span="12" :xs="0"></el-col>
      <el-col :span="12" :xs="24">
        <el-form
          class="login_form"
          :model="loginForm"
          :rules="loginRules"
          ref="loginForms"
        >
          <h1>Hello</h1>
          <h2>欢迎来到ZZY后台管理系统</h2>

          <!-- RSA状态显示 -->
          <div class="rsa-status" :class="rsaStatus.class">
            <el-icon><Lock /></el-icon>
            {{ rsaStatus.text }}
          </div>

          <el-form-item prop="username">
            <el-input
              :prefix-icon="User"
              placeholder="用户名"
              v-model="loginForm.username"
              :disabled="isLoding"
            ></el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              show-password
              :prefix-icon="Lock"
              type="password"
              placeholder="密码"
              v-model="loginForm.password"
              :disabled="isLoding"
              @keyup.enter="login"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              :loading="isLoding"
              class="login_btn"
              type="primary"
              size="default"
              @click="login"
              :disabled="!rsaReady"
            >
              {{ loginButtonText }}
            </el-button>
          </el-form-item>

          <!-- 调试信息（开发环境显示） -->
          <div v-if="isDev" class="debug-info">
            <el-collapse accordion>
              <el-collapse-item title="🔍 调试信息" name="debug">
                <div class="debug-content">
                  <p><strong>RSA状态:</strong> {{ rsaStatus.text }}</p>
                  <p>
                    <strong>密钥ID:</strong> {{ debugInfo.keyId || "未获取" }}
                  </p>
                  <p>
                    <strong>最后更新:</strong>
                    {{ debugInfo.lastUpdate || "从未更新" }}
                  </p>
                  <p>
                    <strong>原始密码:</strong>
                    {{ debugInfo.originalPassword || "未输入" }}
                  </p>
                  <p>
                    <strong>加密长度:</strong>
                    {{ debugInfo.encryptedLength || 0 }} 字符
                  </p>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import useUserStore from "@/store/modules/user";
import { User, Lock } from "@element-plus/icons-vue";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { getTime } from "@/utils/times";
import { RSAUtils } from "@/utils/rsa";

defineOptions({
  name: "Login",
});

// ================== 基础变量 ==================
const userStore = useUserStore();
const $router = useRouter();
const $route = useRoute();
const isDev = import.meta.env.DEV;

// ================== 响应式数据 ==================
const isLoding = ref(false);
const loginForms = ref();
const rsaReady = ref(false);

const loginForm = reactive({
  username: "admin",
  password: "111111",
});

// 调试信息
const debugInfo = reactive({
  keyId: "",
  lastUpdate: "",
  originalPassword: "",
  encryptedLength: 0,
});

// ================== 计算属性 ==================
const rsaStatus = computed(() => {
  if (!rsaReady.value) {
    return {
      text: "🔄 正在建立安全连接...",
      class: "rsa-loading",
    };
  }
  return {
    text: "🔒 安全连接已建立",
    class: "rsa-ready",
  };
});

const loginButtonText = computed(() => {
  if (isLoding.value) return "登录中...";
  if (!rsaReady.value) return "建立安全连接中...";
  return "登录";
});

// ================== RSA初始化 ==================
/**
 * 初始化RSA加密
 */
const initRSA = async () => {
  console.log("🔐 开始初始化RSA加密...");

  try {
    // 验证RSA是否可用
    const isValid = await RSAUtils.getInstance().validatePublicKey();

    if (isValid) {
      rsaReady.value = true;

      // 更新调试信息
      if (isDev) {
        const status = RSAUtils.getInstance().getStatus();
        debugInfo.keyId = status.keyId || "";
        debugInfo.lastUpdate = status.lastUpdateTime
          ? new Date(status.lastUpdateTime).toLocaleString()
          : "";
      }

      console.log("✅ RSA加密初始化成功");
      ElMessage.success("安全连接建立成功");
    } else {
      throw new Error("RSA公钥验证失败");
    }
  } catch (error: any) {
    console.error("❌ RSA加密初始化失败:", error);
    rsaReady.value = false;

    ElMessageBox.confirm(
      "安全连接建立失败，无法保证登录安全。是否重试？",
      "安全警告",
      {
        confirmButtonText: "重试",
        cancelButtonText: "忽略",
        type: "warning",
      }
    )
      .then(() => {
        initRSA(); // 重试
      })
      .catch(() => {
        console.warn("⚠️ 用户选择忽略RSA加密");
      });
  }
};

// ================== 登录逻辑 ==================
/**
 * 登录处理
 */
const login = async () => {
  console.log("🚀 开始登录流程...");

  // 1. 表单验证
  try {
    await loginForms.value.validate();
  } catch (error) {
    console.log("📝 表单验证失败");
    return;
  }

  // 2. 检查RSA状态
  if (!rsaReady.value) {
    ElMessage.warning("安全连接未建立，请稍后再试");
    return;
  }

  isLoding.value = true;

  try {
    // 3. 加密密码
    console.log("🔒 开始加密登录密码...");
    const encryptedPassword = await RSAUtils.encrypt(loginForm.password);

    // 更新调试信息
    if (isDev) {
      debugInfo.originalPassword = loginForm.password;
      debugInfo.encryptedLength = encryptedPassword.length;
    }

    console.log("✅ 密码加密成功，长度:", encryptedPassword.length);

    // 4. 构建登录数据
    const loginData = {
      username: loginForm.username,
      password: encryptedPassword, // 加密后的密码
      timestamp: Date.now(), // 时间戳
    };

    console.log("📤 发送登录请求...");

    // 5. 调用store登录方法
    await userStore.userLogin(loginData);

    // 6. 登录成功处理
    console.log("🎉 登录成功！");

    // 跳转页面
    const redirectPath = ($route.query.redirect as string) || "/";
    await $router.push(redirectPath);

    // 显示欢迎消息
    ElNotification({
      title: `Hi ${getTime()}`,
      message: "欢迎回来！登录已加密保护",
      type: "success",
      duration: 3000,
    });
  } catch (error: any) {
    console.error("❌ 登录失败:", error);

    // 显示错误消息
    ElNotification({
      title: "登录失败",
      message: error.message || "未知错误",
      type: "error",
      duration: 5000,
    });

    // 清空密码
    loginForm.password = "";

    // 如果是RSA相关错误，重新初始化
    if (error.message?.includes("RSA") || error.message?.includes("加密")) {
      console.log("🔄 检测到RSA错误，重新初始化...");
      RSAUtils.clearCache();
      rsaReady.value = false;
      await initRSA();
    }
  } finally {
    isLoding.value = false;
  }
};

// ================== 表单验证 ==================
const validateUsername = (_rule: any, value: any, callback: any) => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/;
  if (!usernameRegex.test(value)) {
    callback(new Error("用户名必须以字母开头，且长度为4-16位"));
  } else {
    callback();
  }
};

const loginRules = {
  username: [
    { required: true, validator: validateUsername, trigger: "change" },
  ],
  password: [
    { required: true, message: "密码不能为空", trigger: "change" },
    { min: 6, max: 20, message: "密码长度为6-20位", trigger: "change" },
  ],
};

// ================== 生命周期 ==================
onMounted(() => {
  console.log("📄 登录页面已挂载");
  // 初始化RSA
  initRSA();
});

onUnmounted(() => {
  console.log("📄 登录页面已卸载");
  // 清理敏感数据
  loginForm.password = "";
  debugInfo.originalPassword = "";
});
</script>
```

📝 总结

- 每人一对 RSA 密钥 ← 这是端到端加密模式
- 服务器一对 RSA 密钥 ← 这是传输加密模式

## AES 加解密

**什么是 AES？**

AES = `Advanced Encryption Standard`（高级加密标准）

- 对称加密算法：加密和解密使用同一个密钥
- 速度很快：比 RSA 快 100-1000 倍
- 安全性高：美国政府标准，军用级别加密
- 支持大数据：可以加密任意大小的数据

**对称加密 vs 非对称加密**

> RSA（非对称加密）

- 公钥加密 → 私钥解密
- 优点：安全性高，不需要共享密钥
- 缺点：速度慢，只能加密小数据

> AES（对称加密）

- 密钥加密 → 同一个密钥解密
- 优点：速度快，可以加密大数据
- 缺点：需要安全地共享密钥

**AES 工作原理（简化版）**

加密过程

```
原始数据: "Hello World"
密钥:     "MySecretKey123456"
        ↓
    【AES加密算法】
        ↓
加密结果: "j8vV2K+5x9..."（乱码）
```

解密过程

```
加密数据: "j8vV2K+5x9..."
密钥:     "MySecretKey123456"（必须是同一个密钥）
        ↓
    【AES解密算法】
        ↓
原始数据: "Hello World"
```

✅ AES 优点

- 对称加密，实现简单：加密解密用同一个密钥
- 速度快：比 RSA 快几百倍
- 无大小限制：可以加密任意大小的数据
- 资源消耗低,CPU 占用很少,内存占用很少

❌ AES 缺点

```
1. 🔑 密钥分发困难
   - 如何安全地把密钥给对方？
   - 网络传输密钥有风险
   - 需要提前约定密钥

2. 👥 密钥管理复杂
   - 每个用户都需要不同密钥
   - 密钥泄露影响范围大
   - 密钥更新困难

3. 🚫 无法数字签名
   - 不能验证消息来源
   - 不能防止否认
   - 需要额外的认证机制

4. 🔄 密钥共享问题
   - 同一密钥加密所有数据
   - 一处泄露，全盘皆输
   - 无法区分不同用户
```

**RSA vs AES 详细对比解析**

| 特性         | RSA (非对称加密)   | AES (对称加密)    |
| ------------ | ------------------ | ----------------- |
| 加密类型     | 非对称 (公钥+私钥) | 对称 (同一密钥)   |
| 密钥数量     | 2 个 (公钥+私钥)   | 1 个 (共享密钥)   |
| 加密速度     | 很慢               | 很快              |
| 数据大小限制 | 有限制 (~245 字节) | 无限制            |
| 密钥分发     | 简单 (公钥可公开)  | 复杂 (需安全传输) |
| 主要用途     | 密钥交换、数字签名 | 大量数据加密      |
| 计算复杂度   | 高                 | 低                |
| 密钥长度     | 2048-4096 位       | 128-256 位        |

## RSA + AES 组合加密

🤔 为什么要组合使用？

```ts
// ❌ 只用RSA的问题
const bigData = "一个1MB的文件内容...";
const encrypted = RSA.encrypt(bigData, publicKey);
// 💥 报错！RSA只能加密245字节

// ❌ 只用AES的问题
const data = "敏感数据";
const key = "mySecretKey123"; // 🚨 如何安全地把这个密钥给对方？
const encrypted = AES.encrypt(data, key);
```

组合使用的天才之处

```ts
// ✅ RSA + AES 完美结合
// RSA负责：安全传输AES密钥（小数据）
// AES负责：快速加密实际数据（大数据）
```

---

**前端加密传输**

流程如下

```
阶段一：密钥准备
前端 → 请求后端RSA公钥 → 后端返回公钥 → 前端缓存公钥

阶段二：数据加密
前端生成AES密钥 → 用AES加密数据 → 用RSA加密AES密钥 → 打包发送

阶段三：数据传输
前端发送加密包 → 网络传输 → 后端接收加密包

阶段四：数据解密
后端用RSA私钥解密AES密钥 → 用AES密钥解密数据 → 获得原始数据

阶段五：业务处理
后端处理业务逻辑 → 返回处理结果
```

数据包结构:

```json
{
  "encryptedData": "AES加密后的数据",
  "encryptedKey": "RSA加密后的AES密钥",
  "timestamp": 1703123456789,
  "algorithm": "RSA-2048+AES-256",
  "version": "1.0"
}
```

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-07-01_16-19-17.png)

**密钥管理**

```
// ✅ 正确做法
- RSA私钥只存在服务器端
- RSA公钥可以缓存，但定期更新
- AES密钥每次随机生成，用完即废

// ❌ 错误做法
- 把RSA私钥存在前端
- 重复使用同一个AES密钥
- 把密钥硬编码在代码中
```

**后端响应加密**

逻辑反转：前端生成密钥对
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-07-01_16-41-10.png)


流程如下
```
加密通信：

1. 前端生成RSA密钥对（公钥 + 私钥）
2. 前端保存私钥到本地
3. 前端发送公钥到后端注册
4. 后端保存前端公钥到Redis

解密响应：

5. 前端请求敏感数据（携带keyId + requireEncrypted标识）
6. 后端检查请求标识
7. 后端生成随机AES密钥
8. 后端用AES密钥加密响应数据
9. 后端用前端公钥加密AES密钥
10. 后端返回加密包


11. 前端接收加密响应包
12. 前端用私钥解密AES密钥
13. 前端用AES密钥解密响应数据
14. 前端得到原始响应数据

```

---

防攻击措施

:::warning

- ✅ 前端私钥永远不发送给后端
- ✅ 前端公钥有过期时间（24 小时）
- ✅ AES 密钥每次随机生成，用完即废
- ✅ 使用 Redis 存储临时密钥信息
  :::


## 最佳实践
```bash
pnpm install crypto-js jsencrypt

pnpm install @types/crypto-js --save-dev
```

```

```

java工具类
```java [CryptoUtils.java]
package com.zzy.admin.utils;

import com.alibaba.fastjson.JSON;
import com.zzy.admin.common.Result;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.HashMap;
import java.util.Map;

/**
 * 后端AES+RSA混合加解密工具类
 * 
 * 功能特点：
 * 1. 与前端CryptoUtils完全兼容的数据格式
 * 2. 支持AES-256-CBC + RSA-2048混合加解密
 * 3. 使用统一的Result响应格式
 * 4. 完整的异常处理和日志记录
 * 5. 线程安全的工具方法
 * 6. 防重放攻击和时间戳验证
 * 
 * @author zzy
 * @version 1.0
 */
@Slf4j
@Component
public class CryptoUtils {
    
    // ==================== 算法配置常量 ====================
    private static final String RSA_ALGORITHM = "RSA";
    private static final String AES_ALGORITHM = "AES";
    private static final String AES_TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final String RSA_TRANSFORMATION = "RSA/ECB/PKCS1Padding";
    private static final int RSA_KEY_SIZE = 2048;
    private static final int AES_KEY_SIZE = 256;
    private static final String ALGORITHM_IDENTIFIER = "RSA-2048+AES-256-CBC";
    private static final String VERSION = "1.0";
    private static final long TIMESTAMP_TOLERANCE = 5 * 60 * 1000L; // 5分钟时间戳容差
    
    // ==================== 数据结构定义 ====================
    
    /**
     * 统一加密数据包格式
     * 必须与前端EncryptedPackage接口完全一致
     */
    @Data
    public static class EncryptedPackage {
        private String data;        // AES加密后的数据(Base64)
        private String key;         // RSA加密后的AES密钥(Base64)
        private String iv;          // AES初始化向量(Base64)
        private Long timestamp;     // 时间戳(防重放攻击)
        private String algorithm;   // 加密算法标识
        private String version;     // 版本号
    }
    
    /**
     * 密钥和IV的组合格式
     * 用于RSA加密时将AES密钥和IV打包在一起
     */
    @Data
    private static class KeyIvCombined {
        private String key;  // AES密钥(Base64)
        private String iv;   // IV向量(Base64)
    }
    
    /**
     * RSA密钥对响应格式
     */
    @Data
    public static class RSAKeyPair {
        private String publicKey;   // RSA公钥(PEM格式)
        private String privateKey;  // RSA私钥(PEM格式)
        private String algorithm;   // 算法标识
        private Integer keySize;    // 密钥长度
        private Long generateTime;  // 生成时间
    }
    
    /**
     * 公钥信息响应格式
     */
    @Data
    public static class PublicKeyInfo {
        private String publicKey;   // RSA公钥(PEM格式)
        private String algorithm;   // 算法标识
        private Integer keySize;    // 密钥长度
        private String version;     // 版本号
        private Long timestamp;     // 时间戳
    }
    
    // ==================== 核心加解密方法 ====================
    
    /**
     * 生成RSA密钥对
     * @return Result包装的密钥对信息
     */
    public static Result<RSAKeyPair> generateRSAKeyPair() {
        try {
            log.info("🔑 开始生成RSA密钥对，密钥长度: {} 位", RSA_KEY_SIZE);
            
            // 生成密钥对
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(RSA_ALGORITHM);
            keyPairGenerator.initialize(RSA_KEY_SIZE);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();
            
            // 获取公钥和私钥
            PublicKey publicKey = keyPair.getPublic();
            PrivateKey privateKey = keyPair.getPrivate();
            
            // 转换为Base64字符串
            String publicKeyString = Base64.encodeBase64String(publicKey.getEncoded());
            String privateKeyString = Base64.encodeBase64String(privateKey.getEncoded());
            
            // 格式化为PEM格式
            String formattedPublicKey = formatPublicKey(publicKeyString);
            String formattedPrivateKey = formatPrivateKey(privateKeyString);
            
            // 构建响应数据
            RSAKeyPair rsaKeyPair = new RSAKeyPair();
            rsaKeyPair.setPublicKey(formattedPublicKey);
            rsaKeyPair.setPrivateKey(formattedPrivateKey);
            rsaKeyPair.setAlgorithm(ALGORITHM_IDENTIFIER);
            rsaKeyPair.setKeySize(RSA_KEY_SIZE);
            rsaKeyPair.setGenerateTime(System.currentTimeMillis());
            
            log.info("✅ RSA密钥对生成成功");
            log.info("📤 公钥长度: {} 字符", formattedPublicKey.length());
            log.info("🔐 私钥长度: {} 字符", formattedPrivateKey.length());
            
            return Result.success("RSA密钥对生成成功", rsaKeyPair);
            
        } catch (Exception e) {
            log.error("❌ 生成RSA密钥对失败: {}", e.getMessage(), e);
            return Result.fail("生成RSA密钥对失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建公钥信息响应
     * @param publicKeyString RSA公钥(PEM格式)
     * @return Result包装的公钥信息
     */
    public static Result<PublicKeyInfo> createPublicKeyInfo(String publicKeyString) {
        try {
            log.info("📤 创建公钥信息响应");
            
            PublicKeyInfo publicKeyInfo = new PublicKeyInfo();
            publicKeyInfo.setPublicKey(publicKeyString);
            publicKeyInfo.setAlgorithm(ALGORITHM_IDENTIFIER);
            publicKeyInfo.setKeySize(RSA_KEY_SIZE);
            publicKeyInfo.setVersion(VERSION);
            publicKeyInfo.setTimestamp(System.currentTimeMillis());
            
            log.info("✅ 公钥信息创建成功");
            return Result.success("获取公钥成功", publicKeyInfo);
            
        } catch (Exception e) {
            log.error("❌ 创建公钥信息失败: {}", e.getMessage(), e);
            return Result.fail("获取公钥失败: " + e.getMessage());
        }
    }
    
    /**
     * 解密前端发送的加密数据包
     * @param encryptedPackage 前端发送的加密数据包
     * @param privateKeyString RSA私钥(PEM格式)
     * @param clazz 解密后数据的目标类型
     * @return Result包装的解密结果
     */
    public static <T> Result<T> decrypt(EncryptedPackage encryptedPackage, String privateKeyString, Class<T> clazz) {
        try {
            log.info("🔓 开始解密数据包...");
            log.info("📋 数据包信息: 算法={}, 版本={}, 时间戳={}", 
                encryptedPackage.getAlgorithm(), 
                encryptedPackage.getVersion(),
                encryptedPackage.getTimestamp());
            
            // 1. 验证数据包格式
            Result<Void> validateResult = validateEncryptedPackage(encryptedPackage);
            if (validateResult.isFail()) {
                return Result.fail(validateResult.getMessage());
            }
            
            // 2. 验证时间戳
            if (!isValidTimestamp(encryptedPackage.getTimestamp())) {
                log.warn("⏰ 时间戳验证失败，时间戳: {}", encryptedPackage.getTimestamp());
                return Result.fail("请求时间戳无效或已过期");
            }
            
            // 3. 解析RSA私钥
            PrivateKey privateKey = parsePrivateKey(privateKeyString);
            if (privateKey == null) {
                return Result.fail("RSA私钥解析失败");
            }
            
            // 4. 用RSA私钥解密AES密钥和IV
            KeyIvCombined keyIvCombined = decryptAESKeyWithRSA(encryptedPackage.getKey(), privateKey);
            if (keyIvCombined == null) {
                return Result.fail("AES密钥解密失败");
            }
            log.info("🔑 AES密钥解密成功");
            
            // 5. 用AES密钥解密数据
            String originalData = decryptDataWithAES(
                encryptedPackage.getData(), 
                keyIvCombined.getKey(), 
                keyIvCombined.getIv()
            );
            if (originalData == null) {
                return Result.fail("AES数据解密失败");
            }
            log.info("📦 AES数据解密成功，原始数据长度: {} 字符", originalData.length());
            
            // 6. 解析JSON数据
            T result;
            if (clazz == String.class) {
                result = clazz.cast(originalData);
            } else {
                result = JSON.parseObject(originalData, clazz);
            }
            
            log.info("✅ 数据包解密完成！");
            return Result.success("解密成功", result);
            
        } catch (Exception e) {
            log.error("❌ 解密数据包失败: {}", e.getMessage(), e);
            return Result.fail("解密失败: " + e.getMessage());
        }
    }
    
    /**
     * 加密响应数据（用于向前端返回加密响应）
     * @param data 要加密的响应数据
     * @param publicKeyString 前端的RSA公钥
     * @return Result包装的加密数据包
     */
    public static Result<EncryptedPackage> encryptResponse(Object data, String publicKeyString) {
        try {
            log.info("🔐 开始加密响应数据...");
            
            // 1. 将数据转换为JSON字符串
            String jsonString = (data instanceof String) ? (String) data : JSON.toJSONString(data);
            log.info("📝 响应数据长度: {} 字符", jsonString.length());
            
            // 2. 生成随机AES密钥和IV
            String aesKey = generateAESKey();
            String iv = generateIV();
            if (aesKey == null || iv == null) {
                return Result.fail("生成AES密钥或IV失败");
            }
            
            // 3. 用AES加密数据
            String encryptedData = encryptDataWithAES(jsonString, aesKey, iv);
            if (encryptedData == null) {
                return Result.fail("AES数据加密失败");
            }
            
            // 4. 解析前端公钥并用其加密AES密钥
            PublicKey publicKey = parsePublicKey(publicKeyString);
            if (publicKey == null) {
                return Result.fail("前端公钥解析失败");
            }
            
            KeyIvCombined keyIvCombined = new KeyIvCombined();
            keyIvCombined.setKey(aesKey);
            keyIvCombined.setIv(iv);
            
            String encryptedKey = encryptAESKeyWithRSA(JSON.toJSONString(keyIvCombined), publicKey);
            if (encryptedKey == null) {
                return Result.fail("AES密钥加密失败");
            }
            
            // 5. 构建加密数据包
            EncryptedPackage encryptedPackage = new EncryptedPackage();
            encryptedPackage.setData(encryptedData);
            encryptedPackage.setKey(encryptedKey);
            encryptedPackage.setIv(iv);
            encryptedPackage.setTimestamp(System.currentTimeMillis());
            encryptedPackage.setAlgorithm(ALGORITHM_IDENTIFIER);
            encryptedPackage.setVersion(VERSION);
            
            log.info("✅ 响应数据加密完成！");
            return Result.success("加密成功", encryptedPackage);
            
        } catch (Exception e) {
            log.error("❌ 加密响应数据失败: {}", e.getMessage(), e);
            return Result.fail("加密响应失败: " + e.getMessage());
        }
    }
    
    // ==================== 验证和工具方法 ====================
    
    /**
     * 验证加密数据包格式
     * @param pkg 加密数据包
     * @return 验证结果
     */
    private static Result<Void> validateEncryptedPackage(EncryptedPackage pkg) {
        try {
            if (pkg == null) {
                return Result.fail("加密数据包不能为空");
            }
            if (pkg.getData() == null || pkg.getData().trim().isEmpty()) {
                return Result.fail("加密数据不能为空");
            }
            if (pkg.getKey() == null || pkg.getKey().trim().isEmpty()) {
                return Result.fail("加密密钥不能为空");
            }
            if (pkg.getTimestamp() == null) {
                return Result.fail("时间戳不能为空");
            }
            if (!ALGORITHM_IDENTIFIER.equals(pkg.getAlgorithm())) {
                log.warn("⚠️ 算法标识不匹配，期望: {}, 实际: {}", ALGORITHM_IDENTIFIER, pkg.getAlgorithm());
                // 不强制要求算法匹配，只记录警告
            }
            
            return Result.success("数据包格式验证通过");
            
        } catch (Exception e) {
            log.error("❌ 验证数据包格式失败: {}", e.getMessage(), e);
            return Result.fail("数据包格式验证失败: " + e.getMessage());
        }
    }
    
    /**
     * 验证时间戳是否有效
     * @param timestamp 时间戳
     * @return 是否有效
     */
    private static boolean isValidTimestamp(Long timestamp) {
        if (timestamp == null) {
            return false;
        }
        long now = System.currentTimeMillis();
        long diff = Math.abs(now - timestamp);
        boolean valid = diff <= TIMESTAMP_TOLERANCE;
        
        if (!valid) {
            log.warn("⏰ 时间戳验证失败，当前时间: {}, 请求时间: {}, 时间差: {} 毫秒", 
                now, timestamp, diff);
        }
        
        return valid;
    }
    
    /**
     * 检查RSA密钥是否有效
     * @param publicKey RSA公钥
     * @return 是否有效
     */
    public static Result<Boolean> validateRSAKey(String publicKey) {
        try {
            if (publicKey == null || publicKey.trim().isEmpty()) {
                return Result.fail("公钥不能为空");
            }
            
            // 尝试解析公钥
            PublicKey key = parsePublicKey(publicKey);
            if (key == null) {
                return Result.fail("公钥格式无效");
            }
            
            // 测试加密功能
            Cipher cipher = Cipher.getInstance(RSA_TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            cipher.doFinal("test".getBytes(StandardCharsets.UTF_8));
            
            log.info("✅ RSA公钥验证通过");
            return Result.success("RSA密钥有效", true);
            
        } catch (Exception e) {
            log.error("❌ RSA密钥验证失败: {}", e.getMessage(), e);
            return Result.fail("RSA密钥无效: " + e.getMessage());
        }
    }
    
    // ==================== 底层加解密实现 ====================
    
    /**
     * 用RSA私钥解密AES密钥
     */
    private static KeyIvCombined decryptAESKeyWithRSA(String encryptedKey, PrivateKey privateKey) {
        try {
            Cipher cipher = Cipher.getInstance(RSA_TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
            
            byte[] encryptedBytes = Base64.decodeBase64(encryptedKey);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            
            String keyIvJson = new String(decryptedBytes, StandardCharsets.UTF_8);
            return JSON.parseObject(keyIvJson, KeyIvCombined.class);
            
        } catch (Exception e) {
            log.error("❌ RSA解密AES密钥失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 用RSA公钥加密AES密钥
     */
    private static String encryptAESKeyWithRSA(String keyIvJson, PublicKey publicKey) {
        try {
            Cipher cipher = Cipher.getInstance(RSA_TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            
            byte[] dataBytes = keyIvJson.getBytes(StandardCharsets.UTF_8);
            byte[] encryptedBytes = cipher.doFinal(dataBytes);
            
            return Base64.encodeBase64String(encryptedBytes);
            
        } catch (Exception e) {
            log.error("❌ RSA加密AES密钥失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 用AES解密数据
     */
    private static String decryptDataWithAES(String encryptedData, String aesKey, String iv) {
        try {
            // 解码密钥和IV
            byte[] keyBytes = Base64.decodeBase64(aesKey);
            byte[] ivBytes = Base64.decodeBase64(iv);
            
            // 创建密钥和IV规范
            SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, AES_ALGORITHM);
            IvParameterSpec ivParameterSpec = new IvParameterSpec(ivBytes);
            
            // 初始化解密器
            Cipher cipher = Cipher.getInstance(AES_TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParameterSpec);
            
            // 解密数据
            byte[] encryptedBytes = Base64.decodeBase64(encryptedData);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            
            return new String(decryptedBytes, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            log.error("❌ AES解密数据失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 用AES加密数据
     */
    private static String encryptDataWithAES(String data, String aesKey, String iv) {
        try {
            // 解码密钥和IV
            byte[] keyBytes = Base64.decodeBase64(aesKey);
            byte[] ivBytes = Base64.decodeBase64(iv);
            
            // 创建密钥和IV规范
            SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, AES_ALGORITHM);
            IvParameterSpec ivParameterSpec = new IvParameterSpec(ivBytes);
            
            // 初始化加密器
            Cipher cipher = Cipher.getInstance(AES_TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, ivParameterSpec);
            
            // 加密数据
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] encryptedBytes = cipher.doFinal(dataBytes);
            
            return Base64.encodeBase64String(encryptedBytes);
            
        } catch (Exception e) {
            log.error("❌ AES加密数据失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 生成随机AES密钥
     */
    private static String generateAESKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(AES_ALGORITHM);
            keyGenerator.init(AES_KEY_SIZE);
            SecretKey secretKey = keyGenerator.generateKey();
            return Base64.encodeBase64String(secretKey.getEncoded());
        } catch (Exception e) {
            log.error("❌ 生成AES密钥失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 生成随机IV
     */
    private static String generateIV() {
        try {
            byte[] iv = new byte[16]; // AES块大小为16字节
            new SecureRandom().nextBytes(iv);
            return Base64.encodeBase64String(iv);
        } catch (Exception e) {
            log.error("❌ 生成IV失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 解析PEM格式的RSA私钥
     */
    private static PrivateKey parsePrivateKey(String privateKeyString) {
        try {
            if (privateKeyString == null || privateKeyString.trim().isEmpty()) {
                return null;
            }
            
            // 清理PEM格式
            String cleanKey = privateKeyString
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
            
            byte[] keyBytes = Base64.decodeBase64(cleanKey);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(RSA_ALGORITHM);
            
            return keyFactory.generatePrivate(keySpec);
            
        } catch (Exception e) {
            log.error("❌ 解析RSA私钥失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 解析PEM格式的RSA公钥
     */
    private static PublicKey parsePublicKey(String publicKeyString) {
        try {
            if (publicKeyString == null || publicKeyString.trim().isEmpty()) {
                return null;
            }
            
            // 清理PEM格式
            String cleanKey = publicKeyString
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
            
            byte[] keyBytes = Base64.decodeBase64(cleanKey);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(RSA_ALGORITHM);
            
            return keyFactory.generatePublic(keySpec);
            
        } catch (Exception e) {
            log.error("❌ 解析RSA公钥失败: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 格式化公钥为PEM格式
     */
    private static String formatPublicKey(String publicKey) {
        StringBuilder sb = new StringBuilder();
        sb.append("-----BEGIN PUBLIC KEY-----\n");
        
        // 每64个字符一行
        for (int i = 0; i < publicKey.length(); i += 64) {
            int end = Math.min(i + 64, publicKey.length());
            sb.append(publicKey, i, end).append("\n");
        }
        
        sb.append("-----END PUBLIC KEY-----");
        return sb.toString();
    }
    
    /**
     * 格式化私钥为PEM格式
     */
    private static String formatPrivateKey(String privateKey) {
        StringBuilder sb = new StringBuilder();
        sb.append("-----BEGIN PRIVATE KEY-----\n");
        
        // 每64个字符一行
        for (int i = 0; i < privateKey.length(); i += 64) {
            int end = Math.min(i + 64, privateKey.length());
            sb.append(privateKey, i, end).append("\n");
        }
        
        sb.append("-----END PRIVATE KEY-----");
        return sb.toString();
    }
}
```



ts工具类
```ts
// utils/cryptoUtils.ts
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'
import request from '@/utils/request' // 使用你现有的axios

// ==================== 数据格式定义 ====================

/**
 * 加密数据包格式（和后端保持一致）
 */
export interface EncryptedPackage {
  data: string           // AES加密后的数据
  key: string            // RSA加密后的AES密钥
  iv: string             // AES的IV
  timestamp: number      // 时间戳
  algorithm: string      // 算法标识
  version: string        // 版本号
}

/**
 * 🔐 简化版加密工具类
 * 
 * 只有3个主要方法：
 * 1. getPublicKey() - 获取服务器公钥
 * 2. encrypt() - 加密数据
 * 3. sendRequest() - 发送加密请求
 */
export class CryptoUtils {
  
  // 缓存服务器公钥
  private static serverPublicKey: string = ''
  
  /**
   * 📥 第一步：获取服务器公钥
   * 
   * 什么时候用：应用启动时调用一次就行
   * 
   * @example
   * ```typescript
   * // 在App.vue或main.ts中调用
   * await CryptoUtils.getPublicKey()
   * ```
   */
  static async getPublicKey(): Promise<boolean> {
    try {
      console.log('📥 获取服务器公钥...')
      
      // 调用后端接口获取公钥
      const result = await request({
        url: '/crypto/public-key',
        method: 'GET'
      })
      
      // 保存公钥
      this.serverPublicKey = result.publicKey
      
      console.log('✅ 公钥获取成功')
      return true
      
    } catch (error) {
      console.error('❌ 获取公钥失败:', error)
      return false
    }
  }
  
  /**
   * 🔐 第二步：加密数据
   * 
   * 什么时候用：要发送敏感数据时
   * 
   * @param data 要加密的数据（对象、字符串都行）
   * @returns 加密后的数据包
   * 
   * @example
   * ```typescript
   * // 加密登录数据
   * const loginData = { username: 'admin', password: '123456' }
   * const encrypted = await CryptoUtils.encrypt(loginData)
   * ```
   */
  static async encrypt(data: any): Promise<EncryptedPackage> {
    try {
      console.log('🔐 开始加密数据...')
      
      // 1. 检查是否有公钥
      if (!this.serverPublicKey) {
        console.log('🔑 没有公钥，先获取公钥...')
        const success = await this.getPublicKey()
        if (!success) {
          throw new Error('获取公钥失败')
        }
      }
      
      // 2. 把数据转成JSON字符串
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data)
      console.log('📝 数据长度:', jsonString.length, '字符')
      
      // 3. 生成随机的AES密钥和IV
      const aesKey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64)  // 32字节 = 256位
      const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64)      // 16字节 = 128位
      console.log('🔑 AES密钥和IV生成完成')
      
      // 4. 用AES加密数据（这个快，适合大数据）
      const aesKeyWords = CryptoJS.enc.Base64.parse(aesKey)
      const ivWords = CryptoJS.enc.Base64.parse(iv)
      
      const encryptedData = CryptoJS.AES.encrypt(jsonString, aesKeyWords, {
        iv: ivWords,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString()
      console.log('📦 AES加密完成')
      
      // 5. 用RSA加密AES密钥（这个安全，但只能加密小数据）
      const jsEncrypt = new JSEncrypt()
      jsEncrypt.setPublicKey(this.serverPublicKey)
      
      // 把AES密钥和IV打包成JSON，然后用RSA加密
      const keyInfo = JSON.stringify({ key: aesKey, iv: iv })
      const encryptedKey = jsEncrypt.encrypt(keyInfo)
      
      if (!encryptedKey) {
        throw new Error('RSA加密失败')
      }
      console.log('🔐 RSA加密完成')
      
      // 6. 打包返回
      const result: EncryptedPackage = {
        data: encryptedData,
        key: encryptedKey,
        iv: iv,
        timestamp: Date.now(),
        algorithm: 'RSA-2048+AES-256-CBC',
        version: '1.0'
      }
      
      console.log('✅ 加密完成！')
      return result
      
    } catch (error) {
      console.error('❌ 加密失败:', error)
      throw new Error(`加密失败: ${error.message}`)
    }
  }
  
  /**
   * 📤 第三步：发送加密请求
   * 
   * 什么时候用：要发送敏感数据到后端时
   * 
   * @param url 接口地址
   * @param data 要发送的数据
   * @returns 后端响应的数据
   * 
   * @example
   * ```typescript
   * // 发送加密登录请求
   * const loginData = { username: 'admin', password: '123456' }
   * const result = await CryptoUtils.sendRequest('/auth/encrypted-login', loginData)
   * 
   * // 发送加密的用户信息
   * const userInfo = { phone: '13800138000', idCard: '123456789' }
   * await CryptoUtils.sendRequest('/user/update', userInfo)
   * ```
   */
  static async sendRequest<T = any>(url: string, data: any): Promise<T> {
    try {
      console.log('📤 发送加密请求:', url)
      
      // 1. 先加密数据
      const encryptedPackage = await this.encrypt(data)
      
      // 2. 发送请求（用你现有的request实例）
      const response: T = await request({
        url: url,
        method: 'POST',
        data: encryptedPackage
      })
      
      console.log('✅ 请求发送成功')
      return response
      
    } catch (error) {
      console.error('❌ 发送请求失败:', error)
      throw error
    }
  }
  
  /**
   * 📊 查看当前状态
   * 
   * 什么时候用：调试时看看工具是否正常
   */
  static getStatus() {
    return {
      hasPublicKey: !!this.serverPublicKey,
      publicKeyLength: this.serverPublicKey.length
    }
  }
  
  /**
   * 🗑️ 清除公钥
   * 
   * 什么时候用：切换环境或重新初始化时
   */
  static clearPublicKey() {
    this.serverPublicKey = ''
    console.log('🗑️ 公钥已清除')
  }
}

// 导出简化的使用方法
export const encrypt = CryptoUtils.encrypt.bind(CryptoUtils)
export const sendEncryptedRequest = CryptoUtils.sendRequest.bind(CryptoUtils)
```