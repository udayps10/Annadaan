package com.example.annadaan;  // <-- change to your actual package name

import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.annadaan.R;

public class CreateAccountngo2 extends AppCompatActivity {

    private static final int CAMERA_REQUEST_CODE = 100;
    private static final int GALLERY_REQUEST_CODE = 101;
    private static final int FILE_REQUEST_CODE = 102;
private Button create,previous;
    ImageView image1, image2, image3, image4;
    ImageView currentSelected;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_accountngo2);
        image1 = findViewById(R.id.image1);
        image2 = findViewById(R.id.image2);
        image3 = findViewById(R.id.image3);
        image4 = findViewById(R.id.image4);

        ImageView.OnClickListener uploadClickListener = v -> {
            currentSelected = (ImageView) v;
            showFileChooserDialog();
        };

        image1.setOnClickListener(uploadClickListener);
        image2.setOnClickListener(uploadClickListener);
        image3.setOnClickListener(uploadClickListener);
        image4.setOnClickListener(uploadClickListener);

        previous=findViewById(R.id.previous);
        create=findViewById(R.id.create_account);
        previous.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        create.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

            }
        });
    }
    private void showFileChooserDialog() {
        String[] options = {"Camera", "Gallery", "Files"};
        int[] icons = {R.drawable.ic_camera, R.drawable.ic_gallery, R.drawable.ic_files}; // <-- add your own drawables

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Select Option");

        ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, android.R.layout.select_dialog_item, options) {
            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView textView = view.findViewById(android.R.id.text1);

                textView.setCompoundDrawablesWithIntrinsicBounds(icons[position], 0, 0, 0);
                textView.setCompoundDrawablePadding(20); // space between icon & text
                return view;
            }
        };

        builder.setAdapter(adapter, (dialog, which) -> {
            switch (which) {
                case 0: // Camera
                    Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    startActivityForResult(cameraIntent, CAMERA_REQUEST_CODE);
                    break;
                case 1: // Gallery
                    Intent galleryIntent = new Intent(Intent.ACTION_PICK,
                            MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                    startActivityForResult(galleryIntent, GALLERY_REQUEST_CODE);
                    break;
                case 2: // Files
                    Intent fileIntent = new Intent(Intent.ACTION_GET_CONTENT);
                    fileIntent.setType("*/*");
                    String[] mimeTypes = {"image/jpeg", "image/png", "application/pdf"};
                    fileIntent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
                    startActivityForResult(Intent.createChooser(fileIntent, "Select File"), FILE_REQUEST_CODE);
                    break;
            }
        });

        builder.show();
    }

}