"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function changePasswordAction(formData: FormData) {
  const session = await getSession();

  if (!session) {
    return { error: "Utilisateur non authentifié." };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Veuillez remplir tous les champs." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les nouveaux mots de passe ne correspondent pas." };
  }

  if (newPassword.length < 6) {
    return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }

  // Supporte session.id ou session.userId / session.email
  const userId = session.id || session.userId;
  const userEmail = session.email;

  // 1. Recherche par ID ou par Email en fallback
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    },
  });

  if (!dbUser || !dbUser.passwordHash) {
    return { error: "Compte utilisateur introuvable." };
  }

  // 2. Vérifier l'ancien mot de passe via passwordHash
  const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!isValid) {
    return { error: "Le mot de passe actuel est incorrect." };
  }

  // 3. Hacher le nouveau mot de passe et sauvegarder dans passwordHash
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { passwordHash: newPasswordHash },
  });

  return { success: "Votre mot de passe a été mis à jour avec succès !" };
}