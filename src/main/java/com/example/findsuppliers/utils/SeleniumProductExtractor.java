package com.example.findsuppliers.utils;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class SeleniumProductExtractor {
    public static void main(String[] args) {
        // Set the path to the ChromeDriver executable (if not in PATH)
        // System.setProperty("webdriver.chrome.driver", "/path/to/chromedriver");

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Uncomment when ready for production
        options.addArguments("--disable-blink-features=AutomationControlled");
        options.addArguments("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        JavascriptExecutor js = (JavascriptExecutor) driver;

        try {
            driver.get("https://jysk.ro/search?query=canapea&type=product");
            System.out.println("Successfully navigated to the page.");

            // Wait for the page to load completely
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("div.product-container")));

            // Find all product containers
            List<WebElement> productContainers = driver.findElements(By.cssSelector("div.product-container"));

            System.out.println("Found " + productContainers.size() + " product containers.");

            // Iterate through each product container and extract information
            for (WebElement productContainer : productContainers) {
                try {
                    // Scroll the product container into view
                    js.executeScript("arguments[0].scrollIntoView(true);", productContainer);

                    // Extract the product name using JavaScript
                    WebElement nameElement = productContainer.findElement(By.cssSelector("span.product-teaser-title__name"));
                    String name = (String) js.executeScript("return arguments[0].textContent;", nameElement);
                    System.out.println("Product Name Element: " + nameElement.getTagName() + " with text: " + name);

                    // Extract the price using JavaScript
                    WebElement priceElement = productContainer.findElement(By.cssSelector("span.product-price-value"));
                    String price = (String) js.executeScript("return arguments[0].textContent;", priceElement);
                    System.out.println("Product Price Element: " + priceElement.getTagName() + " with text: " + price);

                    // Extract the photo URL
                    WebElement photoElement = productContainer.findElement(By.cssSelector("img.w3-product-image"));
                    String photoUrl = photoElement.getAttribute("src");
                    System.out.println("Product Photo URL: " + photoUrl);

                    System.out.println("--------------------");
                    System.out.println("Name: " + name);
                    System.out.println("Price: " + price);
                    System.out.println("Photo URL: " + photoUrl);
                } catch (Exception e) {
                    System.err.println("Error extracting product: " + e.getMessage());
                    continue; // Skip to next product if there's an error
                }
            }

        } catch (Exception e) {
            System.err.println("Error during scraping: " + e.getMessage());
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}
