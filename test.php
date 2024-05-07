<?php

/*
Plugin Name: Custom PHP
Description: Hold Information about Uploaded Media Files
Version: 1.0
Author: Elliot
*/

// Include MongoDB library if not already included
require_once 'vendor/autoload.php';

use MongoDB\Client as MongoClient;

// Hook function to be called before media upload
function custom_collect_media_metadata($file) {
    // Collect metadata
    $file_name = $file['name'];
    $file_type = $file['type'];
    $file_size = $file['size'];

    // Additional metadata specific to your application
    $metadata = [
        'description' => 'Description of the file',
        'uploaded_by' => 'User ID or name who uploaded the file',
        'timestamp' => time(), // Current timestamp
    ];

    // Combine file metadata with additional metadata
    $document = array_merge([
        'fileName' => $file_name,
        'fileType' => $file_type,
        'fileSize' => $file_size
    ], $metadata);

    // Connect to MongoDB (Azure Cosmos DB)
    $connectionString = 'REMOVE BCUS SAY NA SECRETE';
    $client = new MongoClient($connectionString);

    // Select database and collection
    $databaseName = 'cndcw2';
    $collectionName = 'category1';
    $db = $client->$databaseName;
    $collection = $db->$collectionName;

    // Insert document into collection
    $collection->insertOne($document);

    // Return modified file array
    return $file;
}

// Quick test

$file = [
    'name' => 'images/test.jpg',
    'type' => 'image/jpeg',
    'size' => 1024 // Size in bytes
];

// Call the function to insert metadata
insert_metadata_to_cosmos_db($file);



