import random
from typing import Dict
from app.models import Move, Stats, Pokemon
from app.type_chart import TypeChartCache


class DamageService:
    LEVEL = 50
    
    def __init__(self, type_chart: TypeChartCache):
        self.type_chart = type_chart
    
    async def calculate_damage(
        self,
        attacker: Pokemon,
        defender: Pokemon,
        move: Move,
        use_random: bool = True
    ) -> int:
        """Calculate damage using Pokémon damage formula"""
        # Determine attack and defense stats based on move class
        if move.class_ == "special":
            attack_stat = attacker.stats.sp_attack
            defense_stat = defender.stats.sp_defense
        else:  # physical or status
            attack_stat = attacker.stats.attack
            defense_stat = defender.stats.defense
        
        power = move.power
        if power == 0:
            return 0
        
        # Calculate base damage
        base = ((2 * self.LEVEL / 5 + 2) * power * (attack_stat / defense_stat)) / 50 + 2
        
        # STAB (Same Type Attack Bonus)
        stab = 1.5 if move.type in attacker.types else 1.0
        
        # Type effectiveness
        type_effect = self.type_chart.calculate_type_effectiveness(move.type, defender.types)
        
        # Random factor (0.85 - 1.0)
        random_factor = random.uniform(0.85, 1.0) if use_random else 0.95
        
        # Calculate final damage
        damage = int(base * stab * type_effect * random_factor)
        
        return max(1, damage)  # Minimum 1 damage
    
    def check_accuracy(self, move: Move) -> bool:
        """Check if move hits"""
        if move.accuracy >= 100:
            return True
        if move.accuracy <= 0:
            return False
        return random.random() * 100 < move.accuracy

