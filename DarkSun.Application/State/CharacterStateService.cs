// CharacterStateService.cs
public class CharacterStateService
{
    public string? SelectedCharacterId { get; private set; }

    public void SetSelectedCharacter(string charId)
    {
        SelectedCharacterId = charId;
    }
}
