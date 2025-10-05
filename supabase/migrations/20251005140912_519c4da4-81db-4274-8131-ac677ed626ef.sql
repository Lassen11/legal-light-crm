-- Create clients table with all detailed fields for bankruptcy management
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Новый',
  stage TEXT NOT NULL DEFAULT 'Сбор документов',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  debt_amount DECIMAL(15, 2) NOT NULL,
  
  -- Detailed bankruptcy information
  city TEXT,
  creditor_name TEXT,
  overdue_payments TEXT,
  minimum_payments_made BOOLEAN DEFAULT false,
  property_value DECIMAL(15, 2),
  marital_status TEXT,
  spouse_property_value DECIMAL(15, 2),
  purchase_sales_3years TEXT,
  spouse_purchase_sales_3years TEXT,
  receives_benefits BOOLEAN DEFAULT false,
  official_income DECIMAL(15, 2),
  has_criminal_record BOOLEAN DEFAULT false,
  is_ceo_or_ip BOOLEAN DEFAULT false,
  has_bank_deposits BOOLEAN DEFAULT false,
  is_inheriting BOOLEAN DEFAULT false,
  has_registered_organization BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (will add auth later)
CREATE POLICY "Allow all operations on clients"
ON public.clients
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.clients (name, phone, email, status, stage, start_date, debt_amount, city, creditor_name)
VALUES 
  ('Иванов Петр Сергеевич', '+7 (999) 123-45-67', 'ivanov@mail.ru', 'В суде', 'Судебные заседания', '2024-01-15', 850000, 'Москва', 'Сбербанк'),
  ('Петрова Анна Ивановна', '+7 (999) 234-56-78', 'petrova@gmail.com', 'Активный', 'Подготовка заявления', '2024-02-22', 1200000, 'Санкт-Петербург', 'ВТБ'),
  ('Сидоров Михаил Андреевич', '+7 (999) 345-67-89', 'sidorov@yandex.ru', 'Завершен', 'Завершено', '2023-09-10', 650000, 'Казань', 'Альфа-Банк'),
  ('Козлова Елена Владимировна', '+7 (999) 456-78-90', 'kozlova@mail.ru', 'Новый', 'Сбор документов', '2024-03-05', 920000, 'Новосибирск', 'Тинькофф'),
  ('Морозов Дмитрий Петрович', '+7 (999) 567-89-01', 'morozov@gmail.com', 'Активный', 'Реализация имущества', '2023-11-18', 1450000, 'Екатеринбург', 'Газпромбанк');