import React from "react";
import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  ShoppingBasketIcon,
  SmartphoneNfcIcon,
} from "lucide-react";

type TransactionIconProps = { cardPurchaseMethod?: string | null };

export function TransactionIcon({ cardPurchaseMethod }: TransactionIconProps) {
  return (
    <div>
      {cardPurchaseMethod === "ECOMMERCE" && <ShoppingBasketIcon />}
      {cardPurchaseMethod === "CARD_ON_FILE" && <CreditCardIcon />}
      {cardPurchaseMethod === "CARD_PIN" && <BanknoteIcon />}
      {cardPurchaseMethod === "CARD_DETAILS" && <CreditCardIcon />}
      {cardPurchaseMethod === "CONTACTLESS" && <SmartphoneNfcIcon />}
      {!cardPurchaseMethod && <LandmarkIcon />}
    </div>
  );
}
