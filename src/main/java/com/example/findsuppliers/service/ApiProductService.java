package com.example.findsuppliers.service;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApiProductService {

    public List<Map<String, Object>> getProductInfo(String product) {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--disable-blink-features=AutomationControlled");
        options.addArguments("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        JavascriptExecutor js = (JavascriptExecutor) driver;

        List<Map<String, Object>> productInfoList = new ArrayList<>();

        try {
            driver.get("https://jysk.ro/search?query=" + product + "&type=product");
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("div.product-container")));

            List<WebElement> productContainers = driver.findElements(By.cssSelector("div.product-container"));

            for (int i = 0; i < Math.min(5, productContainers.size()); i++) {
                WebElement productContainer = productContainers.get(i);
                js.executeScript("arguments[0].scrollIntoView(true);", productContainer);

                WebElement nameElement = productContainer.findElement(By.cssSelector("span.product-teaser-title__name"));
                String name = (String) js.executeScript("return arguments[0].textContent;", nameElement);

                WebElement priceElement = productContainer.findElement(By.cssSelector("span.product-price-value"));
                String price = (String) js.executeScript("return arguments[0].textContent;", priceElement);

                WebElement photoElement = productContainer.findElement(By.cssSelector("img.w3-product-image"));
                String photoUrl = photoElement.getAttribute("src");

                WebElement linkElement = productContainer.findElement(By.cssSelector("div.product-teaser-body a"));
                String productUrl = "" + linkElement.getAttribute("href");

                Map<String, String> supplier = new HashMap<>();
                supplier.put("nume", "JYSK");
                supplier.put("adresa", "Bd. Mihail Kogălniceanu, Nr. 53, Clădirea Splay, Et. 5, 050104, Sector 5, București");
                supplier.put("contact", "0723 115 975");

                Map<String, Object> produs = new HashMap<>();
                produs.put("nume", name);
                produs.put("pret", Double.parseDouble(price.replaceAll("[^\\d.]", "")));
                produs.put("poza", photoUrl);
                produs.put("url", productUrl); // Add the product URL
                produs.put("furnizor", supplier);

                productInfoList.add(produs);
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }

        return productInfoList;
    }
}
