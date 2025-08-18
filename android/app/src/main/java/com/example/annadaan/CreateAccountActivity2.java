package com.example.annadaan;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.util.Arrays;
import java.util.List;

public class CreateAccountActivity2 extends AppCompatActivity {
    private EditText Address,Businessname,Businessdescription,Website,Averagedailyfood;
    private Button next,previous;
    List<String> type= Arrays.asList("Restaurant","Hotel","Bakery","Grocery","Catering","Street Vendor","Other");
    Spinner spinner;

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_create_account2);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        initalize();
        Typespinner();
        previous.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
              finish();
            }
        });
        next.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(Address.getText().toString().trim().isEmpty()||
                        Businessname.getText().toString().trim().isEmpty()||
                        type.isEmpty()
                ){
                    Toast.makeText(CreateAccountActivity2.this,"Please fill all marked (*) details",Toast.LENGTH_SHORT).show();
                } else {
                    Intent intent=new Intent(CreateAccountActivity2.this, CreateAccountvendor2.class);
                    startActivity(intent);

                }
            }
        });
    }

    private void initalize() {
        Address=findViewById(R.id.Address);
        Businessname=findViewById(R.id.businessname);
        Businessdescription=findViewById(R.id.businessdescription);
        Website=findViewById(R.id.websiteurl);
        Averagedailyfood=findViewById(R.id.Averagedailyfood);
        next=findViewById(R.id.next);
        previous=findViewById(R.id.previous);
    }

    private void Typespinner() {

            spinner=findViewById(R.id.spinner1);
            ArrayAdapter<String> adapter=new ArrayAdapter<>(this, androidx.appcompat.R.layout.support_simple_spinner_dropdown_item,type);
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            spinner.setAdapter(adapter);
            spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                @Override
                public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                    String selecteditem=parent.getItemAtPosition(position).toString();

                }

                @Override
                public void onNothingSelected(AdapterView<?> parent) {


                }
            });
    }
}