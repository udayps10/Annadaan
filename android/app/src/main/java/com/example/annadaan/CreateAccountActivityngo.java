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

public class CreateAccountActivityngo extends AppCompatActivity {
    private EditText Address,orgname,regnumber,capacity,servicearea,areaofoperation,orgdescription;
    private Button next,previous;
    Spinner spinner;
    List<String> type= Arrays.asList("Homeless","Children","Elderly","Animals","General");

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_create_account_activityngo);
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
                if(Address.getText().toString().trim().isEmpty()||orgname.getText().toString().trim().isEmpty()||
                orgdescription.getText().toString().trim().isEmpty()||regnumber.getText().toString().trim().isEmpty()||
                capacity.getText().toString().trim().isEmpty()){
                    Toast.makeText(CreateAccountActivityngo.this,"Please filled all marked (*) details",Toast.LENGTH_SHORT).show();

                }
                else{
                    Intent intent=new Intent(CreateAccountActivityngo.this,CreateAccountngo2.class);
                    startActivity(intent);
                }
            }
        });
    }

    private void initalize() {
        Address=findViewById(R.id.Address);
        orgname=findViewById(R.id.orgname);
        regnumber=findViewById(R.id.registrationnumber);
        capacity=findViewById(R.id.capacity);
        servicearea=findViewById(R.id.servicearea);
        areaofoperation=findViewById(R.id.Areaofoperation);
        orgdescription=findViewById(R.id.businessdescription);
        previous=findViewById(R.id.previous);
        next=findViewById(R.id.next);
    }

    private void Typespinner() {
        spinner=findViewById(R.id.spinner1);
        ArrayAdapter<String> adapter=new ArrayAdapter<>(this,R.layout.spinner_item,type);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_item);
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