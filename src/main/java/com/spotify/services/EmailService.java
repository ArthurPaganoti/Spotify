package com.spotify.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.fromName}")
    private String fromName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Redefinição de Senha - Spotify");

            String emailBody = buildHtmlEmailBody(userName, resetToken);
            helper.setText(emailBody, true);

            mailSender.send(message);

            logger.info("Email de reset de senha enviado com sucesso para: {}", toEmail);

        } catch (MessagingException e) {
            logger.error("Erro ao enviar email para {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Falha ao enviar email de reset de senha", e);
        } catch (Exception e) {
            logger.error("Erro inesperado ao enviar email: {}", e.getMessage());
            throw new RuntimeException("Erro ao processar envio de email", e);
        }
    }

    private String buildHtmlEmailBody(String userName, String token) {
        return String.format("""
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Redefinição de Senha</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    
                                    <!-- Header com gradiente Spotify -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #1DB954 0%%, #1ed760 100%%); padding: 40px 20px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎵 Spotify</h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Conteúdo Principal -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Olá, %s! 👋</h2>
                                            
                                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                                Recebemos uma solicitação para redefinir a senha da sua conta.
                                            </p>
                                            
                                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                                Para redefinir sua senha, utilize o token abaixo na rota <strong>POST /users/password-reset/confirm</strong>:
                                            </p>
                                            
                                            <!-- Token Box -->
                                            <div style="background-color: #f8f9fa; border-left: 4px solid #1DB954; padding: 20px; margin: 0 0 30px 0; border-radius: 5px;">
                                                <p style="margin: 0 0 10px 0; color: #333333; font-weight: bold; font-size: 14px;">
                                                    🔑 Seu Token de Redefinição:
                                                </p>
                                                <code style="background-color: #e9ecef; padding: 12px; display: block; border-radius: 4px; color: #d63384; font-size: 13px; word-wrap: break-word; font-family: 'Courier New', monospace;">
                                                    %s
                                                </code>
                                            </div>
                                            
                                            <!-- Exemplo de uso -->
                                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 0 0 30px 0; border-radius: 5px;">
                                                <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold; font-size: 14px;">
                                                    📝 Exemplo de Requisição:
                                                </p>
                                                <pre style="background-color: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px; margin: 0;">
POST http://localhost:8080/users/password-reset/confirm
Content-Type: application/json

{
  "token": "%s",
  "newPassword": "sua_nova_senha"
}</pre>
                                            </div>
                                            
                                            <!-- Aviso de Segurança -->
                                            <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 0 0 30px 0; border-radius: 5px;">
                                                <p style="margin: 0; color: #721c24; font-size: 14px;">
                                                    ⚠️ <strong>Importante:</strong> Este token expira em <strong>1 hora</strong> e só pode ser usado uma vez.
                                                </p>
                                            </div>
                                            
                                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                                                Se você não solicitou esta redefinição, pode ignorar este email com segurança. Sua senha permanecerá inalterada.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                            <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
                                                Atenciosamente,<br>
                                                <strong style="color: #1DB954;">Equipe Spotify</strong>
                                            </p>
                                            <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                                                © 2025 Spotify. Todos os direitos reservados.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """, userName, token, token);
    }
}
