package com.shufu.homeedu;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.shufu.homeedu.mapper")
public class HomeEduApplication {

    public static void main(String[] args) {
        SpringApplication.run(HomeEduApplication.class, args);
    }

}
