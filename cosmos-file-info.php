<?php
/*
Plugin Name: cosmos file info
Description: Hold Information about Uploaded Media Files
Version: 1.0.1
Author: Elliot
Requires PHP: 8.2
*/

// Include MongoDB library if not already included
require_once 'vendor/autoload.php';

use MongoDB\Client as MongoClient;

// Hook function to be called after media upload
function custom_collect_media_metadata($attachment_id) {
    // Get the file URL based on attachment ID
    $file_url = wp_get_attachment_url($attachment_id);

    // Get the file path from URL
    $file_path = str_replace(wp_get_upload_dir()['baseurl'], wp_get_upload_dir()['basedir'], $file_url);

    // Get the attachment metadata
    $metadata = wp_get_attachment_metadata($attachment_id);

    // Additional metadata specific to your application
    $additional_metadata = [
        //'description' => ' ',
        'timestamp' => time(), // Current timestamp
    ];

    // Merge additional metadata with existing metadata
    $metadata = array_merge($metadata, $additional_metadata);

    // Connect to MongoDB (Azure Cosmos DB)
    $connectionString = 'REMOVE BCUS SAY NA SECRETE';
    $client = new MongoClient($connectionString);

    // Select database and collection
    $databaseName = 'cndcw2';
    $collectionName = 'category1';
    $db = $client->$databaseName;
    $collection = $db->$collectionName;

    // Insert metadata document into collection
    $collection->insertOne($metadata);
}

// Hook the function to the add_attachment action
add_action('add_attachment', 'custom_collect_media_metadata');
