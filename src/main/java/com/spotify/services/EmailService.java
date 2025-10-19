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

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Redefinição de Senha - Wild Music");

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
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String logoUrl = frontendUrl + "/papagaio-icon.png";

        return String.format("""
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Redefinição de Senha - Wild Music</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <!-- Container Principal -->
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #121212; border-radius: 8px; overflow: hidden;">
                                    
                                    <!-- Header Wild Music -->
                                    <tr>
                                        <td style="padding: 40px 40px 30px 40px; text-align: center; background-color: #000000;">
                                            <div style="margin-bottom: 20px;">
                                                <img src="%s" alt="Wild Music" style="width: 80px; height: 80px; border-radius: 50%%; object-fit: cover; display: inline-block; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);"/>
                                            </div>
                                            <h1 style="color: #FFFFFF; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">Wild Music</h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Conteúdo Principal -->
                                    <tr>
                                        <td style="padding: 40px; background-color: #121212;">
                                            <h2 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">Olá, %s!</h2>
                                            <p style="color: #B3B3B3; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
                                                Parece que você esqueceu sua senha. Sem problemas, isso acontece!
                                            </p>
                                            
                                            <!-- Botão Roxo Destaque -->
                                            <table width="100%%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                                <tr>
                                                    <td align="center" style="padding: 20px; background: linear-gradient(135deg, #9333ea 0%%, #a855f7 100%%); border-radius: 500px; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);">
                                                        <a href="%s" style="display: block; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                                                            Redefinir Senha
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="color: #B3B3B3; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                                                Este botão te levará direto para a página de redefinição.<br>
                                                O token já estará preenchido automaticamente.
                                            </p>
                                            
                                            <!-- Separador -->
                                            <div style="height: 1px; background: linear-gradient(90deg, transparent 0%%, #9333ea 50%%, transparent 100%%); margin: 32px 0;"></div>
                                            
                                            <!-- Link Alternativo -->
                                            <p style="color: #B3B3B3; font-size: 13px; margin: 0 0 12px 0;">
                                                <strong style="color: #FFFFFF;">Ou copie e cole este link:</strong>
                                            </p>
                                            <div style="background-color: #181818; border: 1px solid #9333ea; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                                <a href="%s" style="color: #a855f7; text-decoration: none; word-break: break-all; font-size: 12px; font-family: 'Courier New', monospace;">%s</a>
                                            </div>
                                            
                                            <!-- Token para API -->
                                            <details style="margin: 0 0 32px 0;">
                                                <summary style="color: #B3B3B3; font-size: 13px; cursor: pointer; padding: 12px; background-color: #181818; border-radius: 4px; list-style: none; border: 1px solid #2d2d2d;">
                                                    <span style="color: #a855f7;">▶</span> Token para desenvolvedores (API)
                                                </summary>
                                                <div style="background-color: #0a0a0a; border: 1px solid #9333ea; padding: 16px; border-radius: 4px; margin-top: 8px;">
                                                    <code style="color: #a855f7; font-size: 11px; word-wrap: break-word; font-family: 'Courier New', monospace; display: block;">%s</code>
                                                </div>
                                            </details>
                                            
                                            <!-- Alerta de Segurança -->
                                            <div style="background-color: #1a1a1a; border-left: 3px solid #9333ea; padding: 16px; border-radius: 4px; margin: 0 0 32px 0;">
                                                <p style="margin: 0; color: #FFFFFF; font-size: 14px; line-height: 1.5;">
                                                    <strong>⏱️ Este link expira em 24 horas</strong>
                                                </p>
                                                <p style="margin: 8px 0 0 0; color: #B3B3B3; font-size: 13px; line-height: 1.5;">
                                                    Por questões de segurança, o link só pode ser usado uma vez.
                                                </p>
                                            </div>
                                            
                                            <!-- Aviso Final -->
                                            <p style="color: #737373; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                                                Se você não solicitou esta redefinição, ignore este email.<br>
                                                Sua conta permanecerá segura.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #000000; padding: 32px 40px; text-align: center;">
                                            <p style="color: #535353; font-size: 12px; margin: 0 0 8px 0; line-height: 1.5;">
                                                Esta é uma mensagem automática. Por favor, não responda este email.
                                            </p>
                                            <p style="color: #535353; font-size: 12px; margin: 0;">
                                                © 2025 Wild Music
                                            </p>
                                            <div style="margin-top: 20px;">
                                                <a href="#" style="color: #B3B3B3; text-decoration: none; font-size: 11px; margin: 0 8px;">Suporte</a>
                                                <span style="color: #535353;">•</span>
                                                <a href="#" style="color: #B3B3B3; text-decoration: none; font-size: 11px; margin: 0 8px;">Privacidade</a>
                                                <span style="color: #535353;">•</span>
                                                <a href="#" style="color: #B3B3B3; text-decoration: none; font-size: 11px; margin: 0 8px;">Termos</a>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """, logoUrl, userName, resetUrl, resetUrl, resetUrl, token);
    }
}
