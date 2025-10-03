<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");

include("credentials.php");

$request_content = file_get_contents('php://input');
$params = json_decode($request_content, true);
$business = isset($params["societe"]) ? $params["societe"] : null;
$name = isset($params["nom"]) ? $params["nom"] : null;
$phone = isset($params["telephone"]) ? $params["telephone"] : null;
$email = isset($params["email"]) ? $params["email"] : null;
$message = isset($params["message"]) ? $params["message"] : null;

$form_valid =
!empty($business)
&& !empty($name)
&& !empty($phone)
&& !empty($email)
&& !empty($message)
&& filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
if($form_valid){
    $subject = "Demande de renseignements de $name";
    $body = <<<BODYMAIL
De: $name <$email>
Concerne: Contact de $name

Contenu du message:
$message

Société:
$business
$phone
    
    
    
--
Cet E-mail provient du formulaire de contact du site web www.altux.ch
BODYMAIL;

    $headers = array(
        "From" => MAIL_FROM,
        "Content-Type" => "text/plain, charset=UTF-8",
    );
    $result = mail(MAIL_TO, $subject, $body, $headers);

    if ($result) {
        $response = array("success" => true);
    } else {
        $response = array("success" => false, "error" => "FAILED_SENDING_MAIL", "data"=>$body);
    }

    echo json_encode($response);
}