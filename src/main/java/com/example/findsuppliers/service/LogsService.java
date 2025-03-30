package com.example.findsuppliers.service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LogsService {

    public void logResponse(String string){
        File file = new File("src/main/resources/logs.txt");
        try {
            FileWriter myWriter = new FileWriter(file, true);
            myWriter.write("-------------------------------------------------------------------- \n" + string + " " + LocalDateTime.now() + '\n' + "-------------------------------------------------------------------- \n");
            myWriter.close();
           // System.out.println("Successfully wrote to the file.");
        } catch (IOException e) {
            System.out.println("An error occurred writing to the logs file");
            e.printStackTrace();
        }
    }

}
