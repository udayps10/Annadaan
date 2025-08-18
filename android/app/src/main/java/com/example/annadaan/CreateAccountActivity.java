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

public class CreateAccountActivity extends AppCompatActivity {
    private EditText name,email,p_number,password,c_password;
    private Button next,signin;
    Spinner spinner;
    List<String>type= Arrays.asList("Select account Type","Food Vendor","NGO/Charity","Administrator");

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_create_account);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        Type_spinner();
        initalize();
        next.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(name.getText().toString().trim().isEmpty()||
                        email.getText().toString().trim().isEmpty()||
                        p_number.getText().toString().trim().isEmpty()||
                        password.getText().toString().trim().isEmpty()||
                        c_password.getText().toString().trim().isEmpty()
                ){
                    Toast.makeText(CreateAccountActivity.this,"All values must be filled",Toast.LENGTH_SHORT).show();

                } else if (password.getText().toString().trim().equals(c_password.getText().toString().trim())) {
                    String selectedType=spinner.getSelectedItem().toString().trim();
                    Toast.makeText(CreateAccountActivity.this,"please Confirm all the details",Toast.LENGTH_SHORT).show();
                   if (selectedType.equals("Food Vendor" )) {
                       Intent intent = new Intent(CreateAccountActivity.this, CreateAccountActivity2.class);
                       startActivity(intent);
                   } else if (selectedType.equals("NGO/Charity")) {
                       Intent intent = new Intent(CreateAccountActivity.this, CreateAccountActivityngo.class);
                       startActivity(intent);

                   }
                   else if(selectedType.equals("Administrator")){
                       Intent intent = new Intent(CreateAccountActivity.this, CreateAccountActivityadmin.class);
                       startActivity(intent);

                   }
                }
                else{

                    Toast.makeText(CreateAccountActivity.this,"Please confirm the correct password",Toast.LENGTH_SHORT).show();
                }
            }
        });


    }

    private void initalize() {
        name=findViewById(R.id.name);
        email=findViewById(R.id.email);
        p_number=findViewById(R.id.phonenumber);
        password=findViewById(R.id.password);
        c_password=findViewById(R.id.confirmpassword);
        next=findViewById(R.id.next);
        signin=findViewById(R.id.signinhere);

    }

    private void Type_spinner() {
         spinner=findViewById(R.id.spinner1);
        ArrayAdapter<String>adapter=new ArrayAdapter<>(this, R.layout.spinner_item,type);
        adapter.setDropDownViewResource(android.R.layout.select_dialog_singlechoice);
        spinner.setAdapter(adapter);
        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String selecteditem=parent.getItemAtPosition(position).toString();
                if(selecteditem.equals("Select account Type")) {
                    Toast.makeText(CreateAccountActivity.this, "Please select account type", Toast.LENGTH_SHORT).show();
                }
                else{
                    Toast.makeText(CreateAccountActivity.this,"Welcome to Anaadaan "+selecteditem,Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {


            }
        });
    }
}